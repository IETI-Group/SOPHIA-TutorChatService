import { MCPClient } from './mcp/index.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import type { MCPToolResult } from './mcp/types.js';

/**
 * Service that integrates MCP client for course generation
 */
class MCPService {
  private mcpClient: MCPClient;
  private initialized: boolean = false;

  constructor() {
    this.mcpClient = new MCPClient(env.mcpServerUrl);
  }

  /**
   * Initialize the MCP connection (lazy initialization)
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      try {
        await this.mcpClient.connect();
        this.initialized = true;
        logger.info('MCP Service initialized successfully');
      } catch (error) {
        logger.error('Failed to initialize MCP Service:', error);
        throw error;
      }
    }
  }

  /**
   * Generate a complete course structure using AI and MCP
   * This orchestrates multiple MCP calls to create a full course
   */
  async generateCompleteCourse(params: {
    title: string;
    description: string;
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    numberOfSections?: number | undefined;
    lessonsPerSection?: number | undefined;
  }): Promise<{
    success: boolean;
    courseId?: string;
    course?: any;
    sections?: any[];
    error?: string;
  }> {
    await this.ensureInitialized();

    try {
      // Step 1: Create the course
      logger.info('Creating course via MCP', { title: params.title });
      const courseResult = await this.mcpClient.createCourse({
        instructorId: null,
        title: params.title,
        description: params.description,
        price: 0,
        level: params.level,
        aiGenerated: true,
        generationTaskId: `gen_${Date.now()}`,
      });

      if (!courseResult.success || !courseResult.data?.data?.idCourse) {
        return {
          success: false,
          error: courseResult.error || 'Failed to create course',
        };
      }

      const courseId = courseResult.data.data.idCourse;
      logger.info('Course created successfully', { courseId });

      // Step 2: Create sections (optional, based on parameters)
      const sections: any[] = [];
      const numberOfSections = params.numberOfSections || 0;

      for (let i = 1; i <= numberOfSections; i++) {
        const sectionResult = await this.mcpClient.createSection({
          courseId,
          title: `Section ${i}`,
          description: `Section ${i} of ${params.title}`,
          order: i,
          aiGenerated: true,
          suggestedByAi: true,
          generationTaskId: `gen_${Date.now()}_section_${i}`,
        });

        if (sectionResult.success && sectionResult.data?.data) {
          sections.push(sectionResult.data.data);
          logger.info(`Section ${i} created`, { sectionId: sectionResult.data.data.idSection });
        }
      }

      return {
        success: true,
        courseId,
        course: courseResult.data.data,
        sections,
      };
    } catch (error) {
      logger.error('Error generating complete course:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create a course via MCP
   */
  async createCourse(params: {
    instructorId: string | null;
    title: string;
    description: string;
    price: number;
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    aiGenerated: boolean;
  }): Promise<MCPToolResult> {
    await this.ensureInitialized();
    return this.mcpClient.createCourse(params);
  }

  /**
   * List courses via MCP
   */
  async listCourses(filters?: {
    title?: string;
    level?: string;
    aiGenerated?: boolean;
    page?: number;
    size?: number;
  }): Promise<MCPToolResult> {
    await this.ensureInitialized();
    return this.mcpClient.listCourses(filters);
  }

  /**
   * Get a course by ID via MCP
   */
  async getCourseById(courseId: string, includeFullDetails = true): Promise<MCPToolResult> {
    await this.ensureInitialized();
    return this.mcpClient.getCourseById(courseId, includeFullDetails);
  }

  /**
   * Create a section via MCP
   */
  async createSection(params: {
    courseId: string;
    title: string;
    description: string;
    order: number;
    aiGenerated: boolean;
  }): Promise<MCPToolResult> {
    await this.ensureInitialized();
    return this.mcpClient.createSection({
      ...params,
      suggestedByAi: params.aiGenerated,
    });
  }

  /**
   * Create a lesson via MCP
   */
  async createLesson(params: {
    sectionId: string;
    title: string;
    description: string;
    order: number;
    durationMinutes: number;
    lessonType: 'THEORY' | 'PRACTICE' | 'MIXED' | 'PROJECT' | 'CASE_STUDY' | 'DISCUSSION';
    estimatedDifficulty: number;
    aiGenerated: boolean;
  }): Promise<MCPToolResult> {
    await this.ensureInitialized();
    return this.mcpClient.createLesson(params);
  }

  /**
   * Create lesson content via MCP
   */
  async createLessonContent(params: {
    lessonId: string;
    contentType: 'TEXT' | 'VIDEO_SCRIPT' | 'SLIDES' | 'INTERACTIVE' | 'CODE_EXAMPLE' | 'QUIZ' | 'EXERCISE' | 'READING' | 'AUDIO_SCRIPT';
    metadata: any;
    difficultyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    learningTechnique: 'VISUAL' | 'AUDITORY' | 'KINESTHETIC' | 'READING_WRITING' | 'MULTIMODAL';
    aiGenerated: boolean;
  }): Promise<MCPToolResult> {
    await this.ensureInitialized();
    return this.mcpClient.createLessonContent(params);
  }

  /**
   * List all available MCP tools
   */
  async listAvailableTools(): Promise<Array<{ name: string; description?: string | undefined }>> {
    await this.ensureInitialized();
    const tools = await this.mcpClient.listTools();
    return tools.map(tool => ({
      name: tool.name,
      description: tool.description,
    }));
  }

  /**
   * Check if MCP service is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      await this.ensureInitialized();
      return this.mcpClient.isConnected();
    } catch {
      return false;
    }
  }

  /**
   * Disconnect from MCP server
   */
  async disconnect(): Promise<void> {
    if (this.initialized) {
      await this.mcpClient.disconnect();
      this.initialized = false;
    }
  }
}

export const mcpService = new MCPService();
