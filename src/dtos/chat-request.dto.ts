export interface ChatRequestDto {
  message: string;
  context?: number[];
  model?: string;
  chatId?: string; // ID del chat para historial persistente
}
