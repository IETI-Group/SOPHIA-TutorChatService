import { Ollama } from "ollama";
import { env } from "../config/env.js";
import type { ChatRequestDto, CourseAssistantDto } from "../dtos/index.js";
import { OllamaProvider } from "./ai/providers/ollama.provider.js";
import { OpenAIProvider } from "./ai/providers/openai.provider.js";
import { GeminiProvider } from "./ai/providers/gemini.provider.js";
import type { AIProvider } from "./ai/providers/ai-provider.interface.js";

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
      
      // Si el usuario cambia de modelo y envía contexto numérico de otro modelo,
      // esto fallará en Ollama. Para los otros providers, simplemente ignoramos el contexto numérico.
      // Implementamos un retry simple para Ollama si falla por contexto inválido.
      try {
        return await provider.generateResponse(data);
      } catch (error) {
        // Si es Ollama y falla, intentamos sin contexto (reinicio de conversación)
        if (provider instanceof OllamaProvider && data.context && data.context.length > 0) {
          console.warn("Ollama failed with context, retrying without context...");
          return await provider.generateResponse({ ...data, context: [] });
        }
        throw error;
      }
    } catch (error) {
      throw new Error(`AI Service Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }	async generateCourseStructure(data: CourseAssistantDto) {
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

		try {
			const response = await this.ollama.chat({
				model: data.model || env.ollamaModel,
				messages: [{ role: "user", content: prompt }],
			});
			return { response: response.message.content };
		} catch (error) {
			throw new Error(
				`AI Service Error: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}
}

export const aiService = new AIService();
