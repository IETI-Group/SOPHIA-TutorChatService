export interface CourseAssistantDto {
	idea: string;
	guide: string;
  model?: string;
  chatId?: string; // Optional: id of an existing course chat to continue
}
