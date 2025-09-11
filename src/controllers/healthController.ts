import { Request, Response } from "express";
import { logger } from "../utils/logger.js";

export const getHealth = (req: Request, res: Response): void => {
  try {
    const healthData = {
      success: true,
      message: "SOPHIA Tutor Chat Service is running successfully",
      timestamp: new Date().toISOString(),
      service: "sophia-tutor-chat-service",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      uptime: process.uptime(),
      memory: {
        used:
          Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) /
          100,
        total:
          Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) /
          100,
      },
    };

    logger.info("Health check requested", {
      ip: req.ip,
      userAgent: req.get("user-agent"),
    });
    res.status(200).json(healthData);
  } catch (error) {
    logger.error("Error in health check", { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: "Health check failed",
      timestamp: new Date().toISOString(),
    });
  }
};
