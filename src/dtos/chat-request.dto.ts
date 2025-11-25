export interface ChatRequestDto {
  message: string;
  context?: number[];
  model?: string;
  chatId?: string; // Optional: id of an existing chat to continue
}
