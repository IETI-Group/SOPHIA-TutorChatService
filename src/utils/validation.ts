import type { Response } from "express";

export const validateParams = (
	params: Record<string, string | undefined>,
	res: Response,
): params is Record<string, string> => {
	for (const [key, value] of Object.entries(params)) {
		if (!value) {
			res.status(400).json({
				success: false,
				error: `Missing required parameter: ${key}`,
				timestamp: new Date().toISOString(),
			});
			return false;
		}
	}
	return true;
};

export const validateBody = (
	body: Record<string, any>,
	requiredFields: string[],
	res: Response,
): boolean => {
	for (const field of requiredFields) {
		if (!body[field]) {
			res.status(400).json({
				success: false,
				error: `Missing required field: ${field}`,
				timestamp: new Date().toISOString(),
			});
			return false;
		}
	}
	return true;
};
