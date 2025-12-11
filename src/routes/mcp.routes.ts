import { Router } from 'express';
import { mcpController } from '../controllers/mcp.controller.js';

const router:Router = Router();

// MCP Health and Tools
router.get('/health', mcpController.checkHealth.bind(mcpController));
router.get('/tools', mcpController.listTools.bind(mcpController));

// Course operations
router.post('/courses/generate', mcpController.generateCourse.bind(mcpController));
router.post('/courses', mcpController.createCourse.bind(mcpController));
router.get('/courses', mcpController.listCourses.bind(mcpController));
router.get('/courses/:id', mcpController.getCourse.bind(mcpController));

// Section operations
router.post('/sections', mcpController.createSection.bind(mcpController));

// Lesson operations
router.post('/lessons', mcpController.createLesson.bind(mcpController));

// Lesson content operations
router.post('/lesson-content', mcpController.createLessonContent.bind(mcpController));

export default router;
