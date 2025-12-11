import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { logger } from '../../utils/logger.js';
import type { MCPToolCall, MCPToolResult } from './types.js';

/**
 * MCP Client for interacting with the SOPHIA Course Service
 */
export class MCPClient {
  private client: Client | null = null;
  private transport: StreamableHTTPClientTransport | null = null;
  private serverUrl: string;
  private connected: boolean = false;

  constructor(serverUrl: string) {
    this.serverUrl = serverUrl;
  }

  /**
   * Connect to the MCP server
   */
  async connect(): Promise<void> {
    if (this.connected) {
      logger.info('MCP Client already connected');
      return;
    }

    try {
      this.client = new Client({
        name: 'sophia-tutor-chat-client',
        version: '1.0.0',
      });

      this.transport = new StreamableHTTPClientTransport(new URL(this.serverUrl));

      await this.client.connect(this.transport as any);
      this.connected = true;

      logger.info(`MCP Client connected to ${this.serverUrl}`);
    } catch (error) {
      logger.error('Failed to connect to MCP server:', error);
      throw new Error(`MCP connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Disconnect from the MCP server
   */
  async disconnect(): Promise<void> {
    if (!this.connected) {
      return;
    }

    try {
      await this.client?.close();
      this.connected = false;
      logger.info('MCP Client disconnected');
    } catch (error) {
      logger.error('Error disconnecting from MCP server:', error);
    }
  }

  /**
   * Ensure the client is connected before performing operations
   */
  private ensureConnected(): void {
    if (!this.connected || !this.client) {
      throw new Error('MCP Client is not connected. Call connect() first.');
    }
  }

  /**
   * List all available tools from the MCP server
   */
  async listTools(): Promise<Array<{ name: string; description?: string | undefined; inputSchema?: any }>> {
    this.ensureConnected();

    try {
      const response = await this.client!.listTools();
      return response.tools.map(tool => ({
        name: tool.name,
        description: tool.description ?? undefined,
        inputSchema: tool.inputSchema ?? undefined,
      }));
    } catch (error) {
      logger.error('Error listing MCP tools:', error);
      throw new Error(`Failed to list tools: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Call a tool on the MCP server
   */
  async callTool(toolCall: MCPToolCall): Promise<MCPToolResult> {
    this.ensureConnected();

    try {
      logger.info(`Calling MCP tool: ${toolCall.name}`, { arguments: toolCall.arguments });

      const result = await this.client!.callTool({
        name: toolCall.name,
        arguments: toolCall.arguments || {},
      });

      logger.info(`MCP tool ${toolCall.name} response received`, { 
        isError: result.isError,
        contentLength: (result.content as any[])?.length 
      });

      // Parse the response content
      const content = result.content as any[];
      const textContent = content
        .filter((item: any) => item.type === 'text')
        .map((item: any) => item.text)
        .join('\n');

      let parsedData = null;
      try {
        parsedData = JSON.parse(textContent);
        logger.info(`Parsed MCP response for ${toolCall.name}`, { 
          success: parsedData?.success,
          hasData: !!parsedData?.data 
        });
      } catch (parseError) {
        logger.warn(`Could not parse MCP response as JSON for ${toolCall.name}`, { 
          textContent: textContent.substring(0, 200) 
        });
        parsedData = { message: textContent };
      }

      return {
        success: !result.isError,
        data: parsedData,
        rawContent: content,
      };
    } catch (error) {
      logger.error(`Error calling MCP tool ${toolCall.name}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null,
      };
    }
  }

  /**
   * Create a course using the MCP server
   */
  async createCourse(params: {
    instructorId: string | null;
    title: string;
    description: string;
    price: number;
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    aiGenerated: boolean;
    generationTaskId?: string | null;
    generationMetadata?: any;
  }): Promise<MCPToolResult> {
    return this.callTool({
      name: 'create_course',
      arguments: params,
    });
  }

  /**
   * List courses with filtering and pagination
   */
  async listCourses(params?: {
    title?: string;
    instructorId?: string;
    level?: string;
    status?: string;
    priceMin?: number;
    priceMax?: number;
    active?: boolean;
    aiGenerated?: boolean;
    page?: number;
    size?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<MCPToolResult> {
    return this.callTool({
      name: 'list_courses',
      arguments: params || {},
    });
  }

  /**
   * Get a course by ID
   */
  async getCourseById(courseId: string, includeFullDetails = false): Promise<MCPToolResult> {
    return this.callTool({
      name: 'get_course_by_id',
      arguments: { courseId, includeFullDetails },
    });
  }

  /**
   * Create a section (module) in a course
   */
  async createSection(params: {
    courseId: string;
    title: string;
    description: string;
    order: number;
    aiGenerated: boolean;
    suggestedByAi: boolean;
    generationTaskId?: string | null;
  }): Promise<MCPToolResult> {
    return this.callTool({
      name: 'create_section',
      arguments: params,
    });
  }

  /**
   * List sections for a course
   */
  async listSections(params: {
    courseId: string;
    title?: string;
    active?: boolean;
    aiGenerated?: boolean;
    page?: number;
    size?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<MCPToolResult> {
    return this.callTool({
      name: 'list_sections',
      arguments: params,
    });
  }

  /**
   * Create a lesson in a section
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
    generationTaskId?: string | null;
  }): Promise<MCPToolResult> {
    return this.callTool({
      name: 'create_lesson',
      arguments: params,
    });
  }

  /**
   * List lessons for a section
   */
  async listLessons(params: {
    sectionId: string;
    title?: string;
    lessonType?: string;
    active?: boolean;
    aiGenerated?: boolean;
    page?: number;
    size?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<MCPToolResult> {
    return this.callTool({
      name: 'list_lessons',
      arguments: params,
    });
  }

  /**
   * Create lesson content
   */
  async createLessonContent(params: {
    lessonId: string;
    contentType: 'TEXT' | 'VIDEO_SCRIPT' | 'SLIDES' | 'INTERACTIVE' | 'CODE_EXAMPLE' | 'QUIZ' | 'EXERCISE' | 'READING' | 'AUDIO_SCRIPT';
    metadata: any;
    difficultyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    learningTechnique: 'VISUAL' | 'AUDITORY' | 'KINESTHETIC' | 'READING_WRITING' | 'MULTIMODAL';
    orderPreference?: number | null;
    aiGenerated: boolean;
    generationLogId?: string | null;
  }): Promise<MCPToolResult> {
    return this.callTool({
      name: 'create_lesson_content',
      arguments: params,
    });
  }

  /**
   * Check if the client is connected
   */
  isConnected(): boolean {
    return this.connected;
  }
}
