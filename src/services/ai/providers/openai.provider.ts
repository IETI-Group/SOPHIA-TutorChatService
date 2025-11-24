import OpenAI from "openai";
import { env } from "../../../config/env.js";
import type { ChatRequestDto } from "../../../dtos/index.js";
import type { AIProvider } from "./ai-provider.interface.js";

export class OpenAIProvider implements AIProvider {
  private openai: OpenAI;

  constructor() {
    // Se inicializa solo si hay API Key, o se maneja el error al llamar
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "dummy-key", // Evita error al iniciar si no se usa
    });
  }

  async generateResponse(data: ChatRequestDto): Promise<{ response: string; context?: number[] }> {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    // OpenAI no usa 'context' numérico como Ollama.
    // Mapeamos el mensaje actual. El historial se pierde si solo se usa 'context' numérico.
    // Como el usuario pidió NO cambiar el contexto, aquí simplemente ignoramos el context numérico
    // o lo devolvemos vacío, ya que no es compatible.
    
    const completion = await this.openai.chat.completions.create({
      messages: [{ role: "user", content: data.message }],
      model: data.model || "gpt-3.5-turbo",
    });

    return {
      response: completion?.choices?.[0]?.message?.content ?? "",
      context: [], // OpenAI no devuelve tokens de contexto reutilizables de esta forma
    };
  }
}
