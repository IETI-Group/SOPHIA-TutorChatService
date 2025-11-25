import { Ollama } from "ollama";
import { env } from "../config/env.js";
import type { ChatRequestDto, CourseAssistantDto } from "../dtos/index.js";
import { OllamaProvider } from "./ai/providers/ollama.provider.js";
import { OpenAIProvider } from "./ai/providers/openai.provider.js";
import { GeminiProvider } from "./ai/providers/gemini.provider.js";
import type { AIProvider } from "./ai/providers/ai-provider.interface.js";
import { ChatModel } from "../models/chat.model.js";

class AIService {
	private ollama: Ollama;
  private providers: Record<string, AIProvider>;

	constructor() {
		this.ollama = new Ollama({ host: env.ollamaHost });
    this.providers = {
      ollama: new OllamaProvider(),
      openai: new OpenAIProvider(),
      gemini: new GeminiProvider(),
    };
	}

  private getProvider(model?: string): AIProvider {
    if (!model) return this.providers.ollama!;
    
    if (model.startsWith("gpt")) return this.providers.openai!;
    if (model.startsWith("gemini")) return this.providers.gemini!;
    
    return this.providers.ollama!;
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

      // Generar respuesta del asistente
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
}

export const aiService = new AIService();
