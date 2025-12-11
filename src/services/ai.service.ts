import { Ollama } from "ollama";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";
import type { ChatRequestDto, CourseAssistantDto } from "../dtos/index.js";
import { OllamaProvider } from "./ai/providers/ollama.provider.js";
import { OpenAIProvider } from "./ai/providers/openai.provider.js";
import { GeminiProvider } from "./ai/providers/gemini.provider.js";
import type { AIProvider } from "./ai/providers/ai-provider.interface.js";
import { ChatModel } from "../models/chat.model.js";
import { mcpService } from "./mcp.service.js";
import { courseDirectService } from "./course-direct.service.js";
import { 
  mapMcpToolsToOpenAI, 
  mapMcpToolsToGemini, 
  COURSE_ARCHITECT_SYSTEM_PROMPT 
} from "./ai.utils.js";
import { logger } from "../utils/logger.js";

class AIService {
	private ollama: Ollama;
  private providers: Record<string, AIProvider>;
  private openaiClient: OpenAI;
  private geminiClient: GoogleGenerativeAI;

	constructor() {
		this.ollama = new Ollama({ host: env.ollamaHost });
    this.providers = {
      ollama: new OllamaProvider(),
      openai: new OpenAIProvider(),
      gemini: new GeminiProvider(),
    };
    this.openaiClient = new OpenAI({ apiKey: env.openaiKey });
    this.geminiClient = new GoogleGenerativeAI(env.geminiKey);
	}

  private getProvider(model?: string): AIProvider {
    if (!model) return this.providers.ollama!;
    
    if (model.startsWith("gpt")) return this.providers.openai!;
    if (model.startsWith("gemini")) return this.providers.gemini!;
    
    return this.providers.ollama!;
  }

  /**
   * Ejecutar herramienta MCP según su nombre
   * Mapea las herramientas MCP a los métodos correspondientes del mcpService
   * Si MCP falla con error de schema, usa servicio directo como fallback
   */
  private async executeMcpTool(toolName: string, toolArgs: any): Promise<any> {
    try {
      let result;
      switch (toolName) {
        case 'create_course':
          result = await mcpService.createCourse(toolArgs);
          break;
        case 'list_courses':
          result = await mcpService.listCourses(toolArgs);
          break;
        case 'get_course_by_id':
          result = await mcpService.getCourseById(toolArgs.idCourse, toolArgs.includeFullDetails);
          break;
        case 'create_section':
          result = await mcpService.createSection(toolArgs);
          break;
        case 'list_sections':
          // Asumimos que toolArgs tiene idCourse
          result = await mcpService.listCourses({ page: toolArgs.page, size: toolArgs.size });
          break;
        case 'get_section_by_id':
          // No hay método directo, devolver mensaje
          return { message: 'Method not yet implemented in MCP service' };
        case 'create_lesson':
          result = await mcpService.createLesson(toolArgs);
          break;
        case 'list_lessons':
          return { message: 'Method not yet implemented in MCP service' };
        case 'create_lesson_content':
          result = await mcpService.createLessonContent(toolArgs);
          break;
        case 'list_lesson_contents':
          return { message: 'Method not yet implemented in MCP service' };
        default:
          throw new Error(`Unknown MCP tool: ${toolName}`);
      }

      // Verificar si hubo error de schema en el resultado
      if (result && !result.success && result.error && 
          (result.error.includes('output schema') || result.error.includes('additional properties'))) {
        
        logger.warn(`MCP schema error for ${toolName}, using direct API`, { error: result.error });
        
        switch (toolName) {
          case 'create_course':
            const course = await courseDirectService.createCourse(toolArgs);
            return { success: true, data: course };
          case 'create_section':
            const section = await courseDirectService.createSection(toolArgs);
            return { success: true, data: section };
          case 'create_lesson':
            const lesson = await courseDirectService.createLesson(toolArgs);
            return { success: true, data: lesson };
          case 'create_lesson_content':
            const content = await courseDirectService.createLessonContent(toolArgs);
            return { success: true, data: content };
          case 'list_courses':
            const courses = await courseDirectService.listCourses(toolArgs);
            return { success: true, data: courses };
        }
      }

      return result;

    } catch (error: any) {
      // Si el error es una excepción (poco probable con MCP SDK pero posible)
      if (error.message?.includes('output schema') || error.message?.includes('additional properties')) {
        logger.warn(`MCP schema error (exception) for ${toolName}, using direct API`, { error: error.message });
        
        switch (toolName) {
          case 'create_course':
            const course = await courseDirectService.createCourse(toolArgs);
            return { success: true, data: course };
          case 'create_section':
            const section = await courseDirectService.createSection(toolArgs);
            return { success: true, data: section };
          case 'create_lesson':
            const lesson = await courseDirectService.createLesson(toolArgs);
            return { success: true, data: lesson };
          case 'create_lesson_content':
            const content = await courseDirectService.createLessonContent(toolArgs);
            return { success: true, data: content };
          case 'list_courses':
            const courses = await courseDirectService.listCourses(toolArgs);
            return { success: true, data: courses };
          default:
            throw error;
        }
      }
      throw error;
    }
  }

  async chat(data: ChatRequestDto) {
    try {
      const provider = this.getProvider(data.model);
      
      // Buscar o crear chat
      let chat;
      if (data.chatId) {
        chat = await ChatModel.findById(data.chatId);
        if (!chat) {
          throw new Error(`Chat with id ${data.chatId} not found`);
        }
      } else {
        // Crear nuevo chat
        chat = new ChatModel({ 
          messages: [],
          modelName: data.model || env.ollamaModel,
        });
      }

      // Determinar el modelo a usar (el enviado en la petición o el del chat)
      const chatModelField = typeof (chat as any).get === "function"
        ? (chat as any).get("modelName")
        : (chat as any).modelName;
      const modelToUse = (data.model ?? (typeof chatModelField === "string" ? chatModelField : undefined) ?? env.ollamaModel) as string;

      // Guardar mensaje del usuario
      chat.messages.push({
        role: "user",
        content: data.message,
        model: modelToUse,
        timestamp: new Date(),
      });

      // --- INTENT DETECTION: Check if user wants to create the course ---
      const lowerMsg = data.message.toLowerCase();
      const creationTriggers = [
        "crear el curso", "create the course", "generar el curso", "generate the course",
        "crear curso", "create course", "haz el curso", "make the course",
        "construir el curso", "build the course", "implementar el curso"
      ];
      
      const isCreationIntent = creationTriggers.some(trigger => lowerMsg.includes(trigger));

      if (isCreationIntent) {
        logger.info(`[INTENT DETECTION] User wants to create course. Trigger found in: "${data.message}"`);
        
        // Construct context from chat history
        const historyContext = chat.messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
        
        const agentPrompt = `
Based on the following conversation history, create the course that was discussed.
Use the structure, title, and details mentioned in the chat.

CHAT HISTORY:
${historyContext}

USER REQUEST:
${data.message}

Create the course, sections, and lessons now.
        `.trim();

        // Execute Agent Loop with Gemini (most capable model for this task)
        // We use Gemini even if the chat was with Llama2, because we need tool calling capabilities
        const result = await this.generateCourseWithGemini(
          agentPrompt, 
          "gemini-2.0-flash",
          data.userId // Pass user ID as instructor ID for course creation
        );

        // Format the result message
        let responseText = "";
        if (result.success) {
          const courseId = result.executionLog.find((l: any) => l.tool === 'create_course' && l.result?.success)?.result?.data?.idCourse;
          const sections = result.executionLog.filter((l: any) => l.tool === 'create_section' && l.result?.success).length;
          const lessons = result.executionLog.filter((l: any) => l.tool === 'create_lesson' && l.result?.success).length;
          
          responseText = `¡Entendido! He iniciado la creación del curso basado en nuestra conversación.\n\n✅ **Curso Creado Exitosamente**\n\n📊 **Resumen:**\n- **ID del Curso:** ${courseId || 'N/A'}\n- **Secciones creadas:** ${sections}\n- **Lecciones creadas:** ${lessons}\n\n${result.finalResponse}`;
        } else {
          responseText = `Intenté crear el curso pero encontré algunos problemas.\n\n${result.finalResponse}`;
        }

        // Save assistant response
        chat.messages.push({
          role: "assistant",
          content: responseText,
          model: "gemini-2.0-flash", // Mark that this response came from Gemini Agent
          timestamp: new Date(),
        });

        // Mark chat as 'course' type and save the courseId
        const courseId = result.executionLog.find((l: any) => l.tool === 'create_course' && l.result?.success)?.result?.data?.idCourse;
        chat.chatType = "course";
        if (courseId) {
          chat.courseId = courseId;
        }

        await chat.save();

        return {
          chatId: chat._id.toString(),
          response: responseText,
          context: [],
          agentExecution: result // Return execution details if needed by frontend
        };
      }

      // Generar respuesta del asistente (Standard Flow)
      let aiResponse;
      try {
        aiResponse = await provider.generateResponse(data);
      } catch (error) {
        // Si es Ollama y falla, intentamos sin contexto (reinicio de conversación)
        if (provider instanceof OllamaProvider && data.context && data.context.length > 0) {
          console.warn("Ollama failed with context, retrying without context...");
          aiResponse = await provider.generateResponse({ ...data, context: [] });
        } else {
          throw error;
        }
      }

      // Guardar respuesta del asistente
      chat.messages.push({
        role: "assistant",
        content: aiResponse.response,
        model: modelToUse,
        ...(aiResponse.context && { context: aiResponse.context }),
        timestamp: new Date(),
      });

      // Actualizar el modelo del chat si cambió
      if (data.model && data.model !== chatModelField) {
        if (typeof (chat as any).set === "function") {
          (chat as any).set('modelName', data.model);
        } else {
          (chat as any).modelName = data.model;
        }
      }

      // Guardar chat en la base de datos
      await chat.save();

      return {
        chatId: chat._id.toString(),
        response: aiResponse.response,
        context: aiResponse.context,
      };
    } catch (error) {
      throw new Error(`AI Service Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }	async generateCourseStructure(data: CourseAssistantDto) {
		try {
      // Buscar o crear chat de tipo course
      let chat;
      if (data.chatId) {
        chat = await ChatModel.findById(data.chatId);
        if (!chat) {
          throw new Error(`Course chat with id ${data.chatId} not found`);
        }
        if (chat.chatType !== "course") {
          throw new Error(`Chat ${data.chatId} is not a course chat`);
        }
      } else {
        // Crear nuevo chat de tipo course
        chat = new ChatModel({ 
          messages: [],
          modelName: data.model || env.ollamaModel,
          chatType: "course",
        });
      }

      const modelToUse = data.model || chat.modelName || env.ollamaModel;

      // Crear el prompt
      const prompt = `
      Act as a Senior Curriculum Developer and Instructional Designer. Your goal is to create a professional, high-quality course outline optimized for student learning and engagement.

      Course Concept: "${data.idea}"
      Structural Guidelines: "${data.guide}"

      Please design a detailed syllabus that:
      1. Organizes content into logical Sections and Lessons.
      2. Ensures a progressive learning path suitable for the target audience.
      3. Maximizes pedagogical effectiveness.

      Return ONLY the structured course outline, ready for implementation.
    `;

      // Guardar mensaje del usuario (idea + guide)
      chat.messages.push({
        role: "user",
        content: `Course Idea: ${data.idea}\n\nGuidelines: ${data.guide}`,
        model: modelToUse,
        timestamp: new Date(),
      });

      // Obtener el proveedor correcto basado en el modelo
      const courseProvider = this.getProvider(modelToUse);
      
      // Generar respuesta usando el proveedor seleccionado
      const aiResponse = await courseProvider.generateResponse({
        message: prompt,
        model: modelToUse,
      });

      // Guardar respuesta del asistente
      chat.messages.push({
        role: "assistant",
        content: aiResponse.response,
        model: modelToUse,
        timestamp: new Date(),
      });

      // Guardar chat en la base de datos
      await chat.save();

			return { 
        chatId: chat._id.toString(),
        response: aiResponse.response
      };
		} catch (error) {
			throw new Error(
				`AI Service Error: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

  /**
   * AGENT LOOP - OpenAI
   * Genera un curso completo usando el bucle de ejecución de herramientas
   * La IA ejecuta secuencialmente: crear curso -> crear secciones -> crear lecciones -> crear contenido
   * @param promptUsuario - Descripción del curso que el usuario quiere crear
   * @param model - Modelo de OpenAI a usar (default: gpt-4o)
   * @param instructorId - ID del instructor (opcional)
   * @returns Respuesta final de la IA con detalles del proceso
   */
  async generateCourseWithOpenAI(
    promptUsuario: string, 
    model = 'gpt-4o',
    instructorId?: string
  ) {
    logger.info(`[AGENT LOOP - OpenAI] Iniciando generación de curso: "${promptUsuario}"`);

    try {
      // 1. Obtener herramientas del MCP Server
      logger.info('[AGENT LOOP] Obteniendo herramientas del MCP Server...');
      const availableTools = await mcpService.listAvailableTools();
      const openAiTools = mapMcpToolsToOpenAI(availableTools);
      logger.info(`[AGENT LOOP] ${availableTools.length} herramientas MCP disponibles`);

      // 2. Historial de mensajes inicial
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: COURSE_ARCHITECT_SYSTEM_PROMPT
        },
        { 
          role: 'user', 
          content: instructorId 
            ? `${promptUsuario}\n\nInstructor ID: ${instructorId}` 
            : promptUsuario 
        }
      ];

      // 3. EL BUCLE DEL AGENTE (El "Sistema Nervioso")
      // Este bucle permite que la IA ejecute múltiples herramientas secuencialmente
      let conversationFinished = false;
      let loops = 0;
      const MAX_LOOPS = 20; // Aumentado para permitir crear curso completo con secciones y lecciones
      const executionLog: Array<{ tool: string; args: any; result: any }> = [];

      while (!conversationFinished && loops < MAX_LOOPS) {
        loops++;
        logger.info(`[AGENT LOOP] Iteración ${loops}/${MAX_LOOPS}`);
        
        // A. Llamar a la IA
        const response = await this.openaiClient.chat.completions.create({
          model: model,
          messages: messages,
          tools: openAiTools as any,
          tool_choice: 'auto', // La IA decide si usar herramienta o responder texto
        });

        const responseMessage = response.choices[0]?.message;
        if (!responseMessage) {
          throw new Error('No response from OpenAI');
        }
        
        // Agregamos la respuesta de la IA al historial (sea texto o llamada a herramienta)
        messages.push(responseMessage);

        // B. Verificar si la IA quiere ejecutar herramientas
        if (responseMessage.tool_calls) {
          logger.info(`[AGENT LOOP] La IA solicita ejecutar ${responseMessage.tool_calls.length} herramientas`);

          // C. Ejecutar cada herramienta solicitada a través del MCP Client
          for (const toolCall of responseMessage.tool_calls) {
            // Type assertion para tool_calls de función
            if (toolCall.type !== 'function') continue;
            const toolName = toolCall.function.name;
            const toolArgs = JSON.parse(toolCall.function.arguments);

            logger.info(`[MCP EXECUTION] Ejecutando ${toolName}`, { args: toolArgs });

            // --- AQUÍ OCURRE LA MAGIA ---
            // Tu código actúa como el "sistema nervioso" que conecta la IA con el MCP Server
            let toolResult;
            try {
              // Ejecutar la herramienta MCP correspondiente
              toolResult = await this.executeMcpTool(toolName, toolArgs);
              logger.info(`[MCP EXECUTION] ✓ ${toolName} ejecutado exitosamente`, { result: toolResult });
              
              // Guardar en el log de ejecución
              executionLog.push({ tool: toolName, args: toolArgs, result: toolResult });
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              logger.error(`[MCP EXECUTION] ✗ Error ejecutando ${toolName}:`, errorMessage);
              toolResult = { 
                error: true,
                message: errorMessage,
                tool: toolName 
              };
            }

            // D. Devolver el resultado a la IA para que siga pensando
            messages.push({
              tool_call_id: toolCall.id,
              role: 'tool',
              content: JSON.stringify(toolResult),
            });
          }
          // El bucle continúa automáticamente para que la IA procese los resultados
        } else {
          // Si no hubo tool_calls, la IA terminó y nos dio una respuesta final en texto
          logger.info('[AGENT LOOP] ✓ Proceso completado. La IA ha terminado.');
          conversationFinished = true;
          
          return {
            success: true,
            finalResponse: responseMessage.content,
            executionLog: executionLog,
            iterations: loops,
            toolsExecuted: executionLog.length,
          };
        }
      }

      // Si llegamos aquí, alcanzamos el límite de iteraciones
      logger.warn(`[AGENT LOOP] Límite de iteraciones alcanzado (${MAX_LOOPS})`);
      return {
        success: false,
        error: 'Límite de iteraciones alcanzado',
        executionLog: executionLog,
        iterations: loops,
        toolsExecuted: executionLog.length,
      };

    } catch (error) {
      logger.error('[AGENT LOOP - OpenAI] Error:', error);
      throw new Error(
        `Agent Loop Error (OpenAI): ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * AGENT LOOP - Gemini
   * Genera un curso completo usando el bucle de ejecución de herramientas con Google Gemini
   * @param promptUsuario - Descripción del curso que el usuario quiere crear
   * @param model - Modelo de Gemini a usar (default: gemini-1.5-pro)
   * @param instructorId - ID del instructor (opcional)
   * @returns Respuesta final de la IA con detalles del proceso
   */
  async generateCourseWithGemini(
    promptUsuario: string,
    model = 'gemini-2.0-flash',
    instructorId?: string
  ) {
    logger.info(`[AGENT LOOP - Gemini] Iniciando generación de curso: "${promptUsuario}"`);

    try {
      // 1. Obtener y configurar herramientas
      logger.info('[AGENT LOOP] Obteniendo herramientas del MCP Server...');
      const availableTools = await mcpService.listAvailableTools();
      const geminiTools = mapMcpToolsToGemini(availableTools);
      logger.info(`[AGENT LOOP] ${availableTools.length} herramientas MCP disponibles`);

      // 2. Instanciar modelo con herramientas
      const genModel = this.geminiClient.getGenerativeModel({
        model: model,
        tools: [{
          functionDeclarations: geminiTools as any
        }],
      });

      // 3. Iniciar chat con contexto del sistema
      const chat = genModel.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: COURSE_ARCHITECT_SYSTEM_PROMPT }]
          },
          {
            role: "model",
            parts: [{ text: "Entendido. Estoy listo para crear cursos estructurados usando las herramientas disponibles. Seguiré las reglas estrictamente y ejecutaré las acciones secuencialmente sin pedir confirmaciones." }]
          }
        ]
      });

      // 4. Enviar prompt del usuario
      const userPrompt = instructorId 
        ? `${promptUsuario}\n\nInstructor ID: ${instructorId}` 
        : promptUsuario;
      
      let result = await chat.sendMessage(userPrompt);
      let response = result.response;
      
      // 5. BUCLE DEL AGENTE PARA GEMINI
      let loops = 0;
      const MAX_LOOPS = 60;
      const executionLog: Array<{ tool: string; args: any; result: any }> = [];

      while (loops < MAX_LOOPS) {
        const functionCalls = response.functionCalls();

        if (functionCalls && functionCalls.length > 0) {
          loops++;
          logger.info(`[AGENT LOOP] Iteración ${loops}/${MAX_LOOPS}`);
          logger.info(`[AGENT LOOP] Gemini solicita ejecutar ${functionCalls.length} funciones`);
          
          // Array para guardar las respuestas de las funciones
          const functionResponses = [];

          for (const call of functionCalls) {
            const toolName = call.name;
            const toolArgs = call.args;

            logger.info(`[MCP EXECUTION] Ejecutando ${toolName}`, { args: toolArgs });
            
            // Ejecutar vía MCP
            let apiResult;
            try {
              apiResult = await this.executeMcpTool(toolName, toolArgs);
              logger.info(`[MCP EXECUTION] ✓ ${toolName} ejecutado exitosamente`, { result: apiResult });
              
              // Guardar en el log de ejecución
              executionLog.push({ tool: toolName, args: toolArgs, result: apiResult });
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              logger.error(`[MCP EXECUTION] ✗ Error ejecutando ${toolName}:`, errorMessage);
              apiResult = { 
                error: true,
                message: errorMessage,
                tool: toolName 
              };
              executionLog.push({ tool: toolName, args: toolArgs, result: apiResult });
            }

            // Formatear respuesta para Gemini
            functionResponses.push({
              functionResponse: {
                name: toolName,
                response: { result: apiResult } // Gemini espera un objeto JSON dentro de 'response'
              }
            });
          }

          // Enviar los resultados de vuelta a Gemini para que siga pensando
          result = await chat.sendMessage(functionResponses as any);
          response = result.response;
          
        } else {
          // Si no hay llamadas a funciones, es texto final
          logger.info('[AGENT LOOP] ✓ Proceso completado. Gemini ha terminado.');
          
          return {
            success: true,
            finalResponse: response.text(),
            executionLog: executionLog,
            iterations: loops,
            toolsExecuted: executionLog.length,
          };
        }
      }

      // Si llegamos aquí, alcanzamos el límite de iteraciones
      logger.warn(`[AGENT LOOP] Límite de iteraciones alcanzado (${MAX_LOOPS})`);
      return {
        success: false,
        error: 'Límite de iteraciones alcanzado',
        executionLog: executionLog,
        iterations: loops,
        toolsExecuted: executionLog.length,
        partialResponse: response.text(),
      };

    } catch (error) {
      logger.error('[AGENT LOOP - Gemini] Error:', error);
      throw new Error(
        `Agent Loop Error (Gemini): ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

export const aiService = new AIService();
