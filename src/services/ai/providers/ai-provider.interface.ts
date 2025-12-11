import type { ChatRequestDto } from "../../../dtos/index.js";

export interface AIProvider {
  generateResponse(data: ChatRequestDto): Promise<{ response: string; context?: number[] }>;
}
