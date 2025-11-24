import { GoogleGenAI } from "@google/genai";
import type { ChatRequestDto } from "../../../dtos/index.js";
import type { AIProvider } from "./ai-provider.interface.js";

export class GeminiProvider implements AIProvider {
  private ai: GoogleGenAI;

  constructor() {
    // The client gets the API key from the environment variable `GEMINI_API_KEY`.
    // We pass it explicitly to ensure it's used even if the library defaults differ.
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  }

  async generateResponse(data: ChatRequestDto): Promise<{ response: string; context?: number[] }> {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const modelName = data.model || "gemini-2.0-flash";

    const response = await this.ai.models.generateContent({
      model: modelName,
      contents: data.message,
    });

    return {
      response: response.text || "",
      context: [], // Gemini no usa tokens de contexto numéricos compatibles con Ollama
    };
  }
}
