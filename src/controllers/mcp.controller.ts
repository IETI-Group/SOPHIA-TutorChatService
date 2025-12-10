import type { Request, Response, NextFunction } from "express";
import { mcpService } from "../services/mcp.service.js";
import { validateSchema } from "../utils/validation.js";
import * as z from "zod";

// Validation schemas
const generateCourseSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().min(1).max(5000),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
  numberOfSections: z.number().int().min(0).max(20).optional(),
  lessonsPerSection: z.number().int().min(0).max(10).optional(),
});

const createCourseSchema = z.object({
  instructorId: z.string().nullable(),
  title: z.string().min(1).max(500),
  description: z.string().min(1).max(5000),
  price: z.number().min(0),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
  aiGenerated: z.boolean(),
});

const listCoursesSchema = z.object({
  title: z.string().optional(),
  level: z.string().optional(),
  aiGenerated: z.boolean().optional(),
  page: z.number().int().min(1).optional(),
  size: z.number().int().min(1).max(100).optional(),
});

const createSectionSchema = z.object({
  courseId: z.string(),
  title: z.string().min(1).max(500),
  description: z.string().min(1).max(5000),
  order: z.number().int().min(1),
  aiGenerated: z.boolean(),
});

const createLessonSchema = z.object({
  sectionId: z.string(),
  title: z.string().min(1).max(500),
  description: z.string().min(1).max(5000),
  order: z.number().int().min(1),
  durationMinutes: z.number().int().min(1),
  lessonType: z.enum(["THEORY", "PRACTICE", "MIXED", "PROJECT", "CASE_STUDY", "DISCUSSION"]),
  estimatedDifficulty: z.number().int().min(0).max(10),
  aiGenerated: z.boolean(),
});

const createLessonContentSchema = z.object({
  lessonId: z.string(),
  contentType: z.enum([
    "TEXT",
    "VIDEO_SCRIPT",
    "SLIDES",
    "INTERACTIVE",
    "CODE_EXAMPLE",
    "QUIZ",
    "EXERCISE",
    "READING",
    "AUDIO_SCRIPT",
  ]),
  metadata: z.any(),
  difficultyLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
  learningTechnique: z.enum(["VISUAL", "AUDITORY", "KINESTHETIC", "READING_WRITING", "MULTIMODAL"]),
  aiGenerated: z.boolean(),
});

class MCPController {
  /**
   * Generate a complete course structure
   * POST /api/v1/mcp/courses/generate
   */
  async generateCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const data = validateSchema(generateCourseSchema, req.body);

      const result = await mcpService.generateCompleteCourse(data);

      if (!result.success) {
        res.status(500).json({
          success: false,
          message: result.error || "Failed to generate course",
        });
        return;
      }

      res.json({
        success: true,
        message: "Course generated successfully",
        data: {
          courseId: result.courseId,
          course: result.course,
          sections: result.sections,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a course
   * POST /api/v1/mcp/courses
   */
  async createCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const data = validateSchema(createCourseSchema, req.body);

      const result = await mcpService.createCourse(data);

      if (!result.success) {
        res.status(500).json({
          success: false,
          message: result.error || "Failed to create course",
          details: result.data,
        });
        return;
      }

      res.json({
        success: true,
        message: "Course created successfully",
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List courses
   * GET /api/v1/mcp/courses
   */
  async listCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const filters: {
        title?: string;
        level?: string;
        aiGenerated?: boolean;
        page?: number;
        size?: number;
      } = {};

      if (req.query.title) filters.title = req.query.title as string;
      if (req.query.level) filters.level = req.query.level as string;
      if (req.query.aiGenerated !== undefined) {
        filters.aiGenerated = req.query.aiGenerated === "true";
      }
      if (req.query.page) filters.page = Number.parseInt(req.query.page as string);
      if (req.query.size) filters.size = Number.parseInt(req.query.size as string);

      const result = await mcpService.listCourses(filters);

      if (!result.success) {
        res.status(500).json({
          success: false,
          message: result.error || "Failed to list courses",
        });
        return;
      }

      res.json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a course by ID
   * GET /api/v1/mcp/courses/:id
   */
  async getCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(400).json({
          success: false,
          message: "Course ID is required",
        });
        return;
      }

      const includeFullDetails = req.query.includeFullDetails === "true";

      const result = await mcpService.getCourseById(id, includeFullDetails);

      if (!result.success) {
        res.status(404).json({
          success: false,
          message: result.error || "Course not found",
        });
        return;
      }

      res.json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a section
   * POST /api/v1/mcp/sections
   */
  async createSection(req: Request, res: Response, next: NextFunction) {
    try {
      const data = validateSchema(createSectionSchema, req.body);

      const result = await mcpService.createSection(data);

      if (!result.success) {
        res.status(500).json({
          success: false,
          message: result.error || "Failed to create section",
        });
        return;
      }

      res.json({
        success: true,
        message: "Section created successfully",
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a lesson
   * POST /api/v1/mcp/lessons
   */
  async createLesson(req: Request, res: Response, next: NextFunction) {
    try {
      const data = validateSchema(createLessonSchema, req.body);

      const result = await mcpService.createLesson(data);

      if (!result.success) {
        res.status(500).json({
          success: false,
          message: result.error || "Failed to create lesson",
        });
        return;
      }

      res.json({
        success: true,
        message: "Lesson created successfully",
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create lesson content
   * POST /api/v1/mcp/lesson-content
   */
  async createLessonContent(req: Request, res: Response, next: NextFunction) {
    try {
      const data = validateSchema(createLessonContentSchema, req.body);

      const result = await mcpService.createLessonContent(data);

      if (!result.success) {
        res.status(500).json({
          success: false,
          message: result.error || "Failed to create lesson content",
        });
        return;
      }

      res.json({
        success: true,
        message: "Lesson content created successfully",
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List available MCP tools
   * GET /api/v1/mcp/tools
   */
  async listTools(req: Request, res: Response, next: NextFunction) {
    try {
      const tools = await mcpService.listAvailableTools();

      res.json({
        success: true,
        data: tools,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check MCP service health
   * GET /api/v1/mcp/health
   */
  async checkHealth(req: Request, res: Response, next: NextFunction) {
    try {
      const isAvailable = await mcpService.isAvailable();

      res.json({
        success: true,
        available: isAvailable,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const mcpController = new MCPController();
