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
}

export const aiController = new AIController();
