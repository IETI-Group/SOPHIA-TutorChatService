import type { Response } from "express";
import type { z } from "zod";

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

/**
 * Validate request body using Zod schema
 * Throws an error if validation fails
 */
export const validateSchema = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
	const result = schema.safeParse(data);
	if (!result.success) {
		const errors = result.error.issues.map((err: any) => `${err.path.join(".")}: ${err.message}`).join(", ");
		throw new Error(`Validation error: ${errors}`);
	}
	return result.data;
};
