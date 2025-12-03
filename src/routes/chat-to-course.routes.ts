import { Router } from 'express';
import { chatToCourseController } from '../controllers/chat-to-course.controller';

const router:Router = Router();

/**
 * @route POST /api/v1/chat-to-course/convert
 * @desc Convierte un chat de curso en un curso real usando Agent Loop + MCP
 * @body {chatId, assistantMessage, userPrompt, instructorId?, provider?, model?}
 */
router.post('/convert', chatToCourseController.convertChatToCourse);

/**
 * @route POST /api/v1/chat-to-course/batch
 * @desc Convierte múltiples chats en batch
 * @body {chats: Array, provider?, model?}
 */
router.post('/batch', chatToCourseController.convertBatchChatsToCourses);

export default router;
