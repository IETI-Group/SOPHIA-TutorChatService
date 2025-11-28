import type { NextFunction, Request, Response } from "express";
import { aiService } from "../services/ai.service.js";
import { validateBody } from "../utils/validation";

export class AIController {
	async chat(req: Request, res: Response, next: NextFunction) {
		try {
			if (!validateBody(req.body, ["message"], res)) return;
			const response = await aiService.chat(req.body);
			res.json({
				success: true,
				...response,
			});
		} catch (error) {
			next(error);
		}
	}

	async generateCourseStructure(
		req: Request,
		res: Response,
		next: NextFunction,
	) {
		try {
			if (!validateBody(req.body, ["idea", "guide"], res)) return;
			const response = await aiService.generateCourseStructure(req.body);
			res.json({
				success: true,
				...response,
			});
		} catch (error) {
			next(error);
		}
	}

	/**
	 * AGENT LOOP - Genera un curso completo con IA usando herramientas MCP
	 * La IA ejecuta secuencialmente todas las acciones necesarias:
	 * 1. Crear curso
	 * 2. Crear secciones
	 * 3. Crear lecciones para cada sección
	 * 4. Crear contenido para cada lección
	 * 
	 * @example
	 * POST /api/v1/ai/generate-course
	 * {
	 *   "prompt": "Crea un curso de Python para principiantes con 3 módulos",
	 *   "provider": "openai",
	 *   "model": "gpt-4o",
	 *   "instructorId": "instructor-uuid-123" // opcional
	 * }
	 */
	async generateCourseWithAgent(
		req: Request,
		res: Response,
		next: NextFunction,
	) {
		try {
			// Validar campos requeridos
			if (!validateBody(req.body, ["prompt"], res)) return;

			const { prompt, provider = "openai", model, instructorId } = req.body;

			// Validar provider
			if (!["openai", "gemini"].includes(provider)) {
				res.status(400).json({
					success: false,
					error: "Provider must be 'openai' or 'gemini'",
				});
				return;
			}

			// Ejecutar el Agent Loop correspondiente
			let response;
			if (provider === "openai") {
				response = await aiService.generateCourseWithOpenAI(
					prompt,
					model || "gpt-4o",
					instructorId
				);
			} else {
				response = await aiService.generateCourseWithGemini(
					prompt,
					model || "gemini-1.5-pro",
					instructorId
				);
			}

			res.json({
				provider: provider,
				...response,
			});
		} catch (error) {
			next(error);
		}
	}
}

export const aiController = new AIController();
