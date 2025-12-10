import { env } from '../config/env';
import { logger } from '../utils/logger';
import crypto from 'crypto';

/**
 * Servicio para interactuar directamente con CourseService API
 * Bypass MCP validation issues
 */
export class CourseDirectService {
	private baseUrl: string;

	constructor() {
		// Asumir que CourseService está en el puerto 3000
		this.baseUrl = env.courseServiceUrl || 'http://localhost:3000/api/v1';
	}

	/**
	 * Crear curso directamente sin MCP
	 */
	async createCourse(data: {
		instructorId: string | null;
		title: string;
		description: string;
		price: number;
		level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
		aiGenerated?: boolean;
		generationTaskId?: string | null;
	}): Promise<any> {
		try {
			const response = await fetch(`${this.baseUrl}/courses`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...data,
					generationTaskId: data.generationTaskId || crypto.randomUUID(),
					lastAIUpdateAt: new Date().toISOString(),
				}),
			});

			if (!response.ok) {
				const error = await response.text();
				throw new Error(`CourseService error: ${error}`);
			}

			const result = (await response.json()) as any;
			logger.info('Course created directly', { courseId: result.data?.idCourse });
			return result.data;
		} catch (error) {
			logger.error('Error creating course directly', { error });
			throw error;
		}
	}

	/**
	 * Crear sección directamente
	 */
	async createSection(data: {
		courseId: string;
		title: string;
		description: string;
		order: number;
		aiGenerated?: boolean;
	}): Promise<any> {
		try {
			const response = await fetch(`${this.baseUrl}/courses/${data.courseId}/sections`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...data,
					idCourse: data.courseId, // Map courseId to idCourse
					aiGenerated: true,
					generationTaskId: crypto.randomUUID(),
					lastAIUpdateAt: new Date().toISOString(),
				}),
			});

			if (!response.ok) {
				const error = await response.text();
				throw new Error(`CourseService error: ${error}`);
			}

			const result = (await response.json()) as any;
			logger.info('Section created directly', { sectionId: result.data?.idSection });
			return result.data;
		} catch (error) {
			logger.error('Error creating section directly', { error });
			throw error;
		}
	}

	/**
	 * Crear lección directamente
	 */
	async createLesson(data: {
		sectionId: string;
		title: string;
		description: string;
		order: number;
		durationMinutes: number;
		lessonType:
			| 'THEORY'
			| 'PRACTICE'
			| 'MIXED'
			| 'PROJECT'
			| 'CASE_STUDY'
			| 'DISCUSSION';
		estimatedDifficulty: number;
		aiGenerated?: boolean;
	}): Promise<any> {
		try {
			const response = await fetch(`${this.baseUrl}/sections/${data.sectionId}/lessons`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...data,
					idSection: data.sectionId, // Map sectionId to idSection
					aiGenerated: true,
					generationTaskId: crypto.randomUUID(),
					lastAIUpdateAt: new Date().toISOString(),
				}),
			});

			if (!response.ok) {
				const error = await response.text();
				throw new Error(`CourseService error: ${error}`);
			}

			const result = (await response.json()) as any;
			logger.info('Lesson created directly', { lessonId: result.data?.idLesson });
			return result.data;
		} catch (error) {
			logger.error('Error creating lesson directly', { error });
			throw error;
		}
	}

	/**
	 * Crear contenido de lección directamente
	 */
	async createLessonContent(data: {
		lessonId: string;
		contentType: string;
		metadata: any;
		difficultyLevel: string;
		learningTechnique: string;
		orderPreference: number;
	}): Promise<any> {
		try {
			const response = await fetch(`${this.baseUrl}/lessons/${data.lessonId}/contents`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...data,
					lessonId: data.lessonId,
					aiGenerated: true,
					generationTaskId: crypto.randomUUID(),
					generationLogId: crypto.randomUUID(),
					lastAIUpdateAt: new Date().toISOString(),
					parentContentId: null,
				}),
			});

			if (!response.ok) {
				const error = await response.text();
				throw new Error(`CourseService error: ${error}`);
			}

			const result = (await response.json()) as any;
			logger.info('Lesson content created directly', {
				contentId: result.data?.idContent,
			});
			return result.data;
		} catch (error) {
			logger.error('Error creating lesson content directly', { error });
			throw error;
		}
	}

	/**
	 * Listar cursos
	 */
	async listCourses(params?: {
		page?: number;
		size?: number;
		sortBy?: string;
		sortOrder?: 'asc' | 'desc';
	}): Promise<any> {
		try {
			const queryParams = new URLSearchParams();
			// Default values to prevent backend crash
			const page = params?.page || 1;
			const size = params?.size || 10;
			const sortBy = params?.sortBy || 'createdAt';
			const sortOrder = params?.sortOrder || 'desc';

			queryParams.append('page', page.toString());
			queryParams.append('size', size.toString());
			queryParams.append('sortBy', sortBy);
			queryParams.append('sortOrder', sortOrder);

			const url = `${this.baseUrl}/courses?${queryParams.toString()}`;
			const response = await fetch(url);

			if (!response.ok) {
				const error = await response.text();
				throw new Error(`CourseService error: ${error}`);
			}

			return await response.json();
		} catch (error) {
			logger.error('Error listing courses', { error });
			throw error;
		}
	}
}

export const courseDirectService = new CourseDirectService();
