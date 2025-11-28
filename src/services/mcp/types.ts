/**
 * MCP Tool Call definition
 */
export interface MCPToolCall {
  name: string;
  arguments?: Record<string, any>;
}

/**
 * MCP Tool Result
 */
export interface MCPToolResult {
  success: boolean;
  data: any;
  error?: string;
  rawContent?: any[];
}

/**
 * Course creation parameters
 */
export interface CreateCourseParams {
  instructorId: string | null;
  title: string;
  description: string;
  price: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  aiGenerated: boolean;
  generationTaskId?: string | null;
  generationMetadata?: any;
}

/**
 * Section creation parameters
 */
export interface CreateSectionParams {
  courseId: string;
  title: string;
  description: string;
  order: number;
  aiGenerated: boolean;
  suggestedByAi: boolean;
  generationTaskId?: string | null;
}

/**
 * Lesson creation parameters
 */
export interface CreateLessonParams {
  sectionId: string;
  title: string;
  description: string;
  order: number;
  durationMinutes: number;
  lessonType: 'THEORY' | 'PRACTICE' | 'MIXED' | 'PROJECT' | 'CASE_STUDY' | 'DISCUSSION';
  estimatedDifficulty: number;
  aiGenerated: boolean;
  generationTaskId?: string | null;
}

/**
 * Lesson content creation parameters
 */
export interface CreateLessonContentParams {
  lessonId: string;
  contentType: 'TEXT' | 'VIDEO_SCRIPT' | 'SLIDES' | 'INTERACTIVE' | 'CODE_EXAMPLE' | 'QUIZ' | 'EXERCISE' | 'READING' | 'AUDIO_SCRIPT';
  metadata: any;
  difficultyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  learningTechnique: 'VISUAL' | 'AUDITORY' | 'KINESTHETIC' | 'READING_WRITING' | 'MULTIMODAL';
  orderPreference?: number | null;
  aiGenerated: boolean;
  generationLogId?: string | null;
}
