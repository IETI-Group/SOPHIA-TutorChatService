import { config } from "dotenv";
import app from "./app.js";
import { logger } from "./utils/logger.js";

// Cargar variables de entorno
config();

const PORT = process.env.PORT || 3000;

// Manejo de excepciones no capturadas
process.on("uncaughtException", (err: Error) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

// Manejo de promesas rechazadas no capturadas
process.on(
  "unhandledRejection",
  (reason: unknown, promise: Promise<unknown>) => {
    logger.error("Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
  }
);

// Función para iniciar el servidor
const startServer = (): void => {
  try {
    const server = app.listen(PORT, () => {
      logger.info(`🚀 SOPHIA Tutor Chat Service started successfully`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      logger.info(`📡 Server running on port ${PORT}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/api/v1/health`);
      logger.info(`🏠 Home: http://localhost:${PORT}/`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      server.close(() => {
        logger.info("Process terminated gracefully");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Iniciar el servidor
startServer();

export default app;
