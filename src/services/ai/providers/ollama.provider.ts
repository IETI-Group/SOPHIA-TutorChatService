import { Ollama } from "ollama";
import { env } from "../../../config/env.js";
import type { ChatRequestDto } from "../../../dtos/index.js";
import type { AIProvider } from "./ai-provider.interface.js";

export class OllamaProvider implements AIProvider {
  private ollama: Ollama;

  constructor() {
    this.ollama = new Ollama({ host: env.ollamaHost });
  }

  async generateResponse(data: ChatRequestDto): Promise<{ response: string; context?: number[] }> {
    const response = await this.ollama.generate({
      model: data.model || env.ollamaModel,
      prompt: data.message,
      context: data.context || [],
      stream: false,
    });
    return {
      response: response.response,
      context: response.context,
    };
  }
}
