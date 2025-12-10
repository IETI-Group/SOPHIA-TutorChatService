import type { Request, Response } from 'express';
import { aiService } from '../services/ai.service';
import { logger } from '../utils/logger';

/**
 * Controller para convertir chats de curso en cursos reales usando Agent Loop
 */
export const chatToCourseController = {
	/**
	 * Convierte un chat de curso en un curso real usando Agent Loop + MCP
	 * 
	 * @route POST /api/v1/chat-to-course/convert
	 * @body {
	 *   chatId: string,
	 *   assistantMessage: string,
	 *   userPrompt: string,
	 *   instructorId?: string,
	 *   provider?: 'openai' | 'gemini',
	 *   model?: string
	 * }
	 */
	async convertChatToCourse(req: Request, res: Response): Promise<void> {
		try {
			const {
				chatId,
				assistantMessage,
				userPrompt,
				instructorId = null,
				provider = 'gemini',
				model = 'gemini-2.0-flash',
			} = req.body;

			// Validación
			if (!chatId || !assistantMessage) {
				res.status(400).json({
					success: false,
					error: 'chatId and assistantMessage are required',
				});
				return;
			}

			logger.info('Converting chat to course', {
				chatId,
				provider,
				model,
				instructorId,
			});

			// Construir prompt para Agent Loop
			const agentPrompt = buildAgentPrompt(
				userPrompt,
				assistantMessage,
				instructorId
			);

			// Ejecutar Agent Loop
			let result;
			if (provider === 'openai') {
				result = await aiService.generateCourseWithOpenAI(
					agentPrompt,
					model || 'gpt-4o'
				);
			} else {
				result = await aiService.generateCourseWithGemini(
					agentPrompt,
					model || 'gemini-2.0-flash'
				);
			}

			// Extraer información del curso creado
			const courseInfo = extractCourseInfo(result);

			res.json({
				success: true,
				chatId,
				provider,
				course: courseInfo,
				agentExecution: {
					iterations: result.iterations,
					toolsExecuted: result.toolsExecuted,
					finalResponse: result.finalResponse,
				},
				executionLog: result.executionLog,
			});
		} catch (error) {
			logger.error('Error converting chat to course', { error });
			res.status(500).json({
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			});
		}
	},

	/**
	 * Convierte múltiples chats en batch
	 * 
	 * @route POST /api/v1/chat-to-course/batch
	 */
	async convertBatchChatsToCourses(req: Request, res: Response): Promise<void> {
		try {
			const {
				chats,
				provider = 'gemini',
				model = 'gemini-2.0-flash',
			} = req.body;

			if (!Array.isArray(chats) || chats.length === 0) {
				res.status(400).json({
					success: false,
					error: 'chats array is required',
				});
				return;
			}

			logger.info('Converting batch chats to courses', {
				count: chats.length,
				provider,
				model,
			});

			const results = [];
			const errors = [];

			for (const chat of chats) {
				try {
					const agentPrompt = buildAgentPrompt(
						chat.userPrompt,
						chat.assistantMessage,
						chat.instructorId
					);

					let result;
					if (provider === 'openai') {
						result = await aiService.generateCourseWithOpenAI(
							agentPrompt,
							model || 'gpt-4o'
						);
					} else {
						result = await aiService.generateCourseWithGemini(
							agentPrompt,
							model || 'gemini-2.0-flash'
						);
					}

					const courseInfo = extractCourseInfo(result);

					results.push({
						chatId: chat.chatId,
						success: true,
						course: courseInfo,
						iterations: result.iterations,
						toolsExecuted: result.toolsExecuted,
					});
				} catch (error) {
					errors.push({
						chatId: chat.chatId,
						success: false,
						error: error instanceof Error ? error.message : 'Unknown error',
					});
				}
			}

			res.json({
				success: true,
				provider,
				total: chats.length,
				successful: results.length,
				failed: errors.length,
				results,
				errors,
			});
		} catch (error) {
			logger.error('Error in batch conversion', { error });
			res.status(500).json({
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			});
		}
	},
};

/**
 * Construye el prompt para el Agent Loop basado en el chat
 */
function buildAgentPrompt(
	userPrompt: string,
	assistantMessage: string,
	instructorId: string | null
): string {
	const instructorPart = instructorId
		? `\n\nIMPORTANT: Use instructorId="${instructorId}" for all course creation.`
		: '\n\nIMPORTANT: Use instructorId=null since no instructor was specified.';

	return `
You are a Course Architect AI. Your task is to convert the following course structure into a REAL course in the SOPHIA platform using the available MCP tools.

ORIGINAL USER REQUEST:
${userPrompt}

PROPOSED COURSE STRUCTURE:
${assistantMessage}

YOUR MISSION:
1. Analyze the course structure above
2. Create the course using create_course tool
3. Create all sections (modules) using create_section tool
4. Create all lessons for each section using create_lesson tool
5. Optionally create lesson content using create_lesson_content tool

IMPORTANT GUIDELINES:
- Extract the course title, description, and determine appropriate level (BEGINNER/INTERMEDIATE/ADVANCED)
- Set a reasonable price (default 29.99 if not specified)
- Preserve the structure: sections → lessons → topics
- Maintain the order specified in the structure
- For each lesson, estimate duration in minutes (default: 30-45 minutes)
- Choose appropriate lessonType: THEORY, PRACTICE, MIXED, PROJECT, CASE_STUDY, or DISCUSSION
- Set estimatedDifficulty (0-10 scale)${instructorPart}

EXECUTION STRATEGY:
1. First, create the main course using create_course.
2. IMMEDIATELY use the courseId returned by create_course to create sections. DO NOT call list_courses.
3. After creating each section, use its sectionId to create lessons.
4. Do not stop until all sections and lessons are created.

Work step by step. After creating the course, use its ID to create sections. After creating each section, use its ID to create lessons.

BEGIN THE CONVERSION NOW.
`.trim();
}

/**
 * Extrae información del curso de los logs de ejecución
 */
function extractCourseInfo(result: any): any {
	const courseCreation = result.executionLog.find(
		(log: any) => log.tool === 'create_course' && log.result?.success
	);

	const sections = result.executionLog.filter(
		(log: any) => log.tool === 'create_section' && log.result?.success
	);

	const lessons = result.executionLog.filter(
		(log: any) => log.tool === 'create_lesson' && log.result?.success
	);

	return {
		courseId: courseCreation?.result?.data?.idCourse || null,
		title: courseCreation?.args?.title || null,
		level: courseCreation?.args?.level || null,
		price: courseCreation?.args?.price || null,
		sectionsCreated: sections.length,
		lessonsCreated: lessons.length,
		creationDetails: {
			course: courseCreation?.result?.data || null,
			sections: sections.map((s: any) => ({
				id: s.result?.data?.idSection,
				title: s.args?.title,
				order: s.args?.order,
			})),
			lessons: lessons.map((l: any) => ({
				id: l.result?.data?.idLesson,
				title: l.args?.title,
				order: l.args?.order,
				type: l.args?.lessonType,
			})),
		},
	};
}
