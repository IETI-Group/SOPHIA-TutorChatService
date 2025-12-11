import "dotenv/config";
import app from "./app.js";
import { logger } from "./utils/logger.js";
import { connectDatabase } from "./config/database.js";


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
const startServer = async (): Promise<void> => {
  try {
    // Conectar a la base de datos
    await connectDatabase();
    
    const server = app.listen(PORT, () => {
      console.log(`🚀 SOPHIA Tutor Chat Service started successfully`);
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/v1/health`);
      console.log(`🏠 Home: http://localhost:${PORT}/`);
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
