import express, { type Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "dotenv";
import { logger } from "./utils/logger.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import routes from "./routes/index.js";

// Cargar variables de entorno
config();

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.config();
    this.routes();
    this.errorHandling();
  }

  private config(): void {
    // Middlewares de seguridad
    this.app.use(helmet());

    // CORS
    this.app.use(
      cors({
        origin: process.env.CORS_ORIGIN || "*",
        credentials: true,
      })
    );

    // Logging HTTP requests
    if (process.env.NODE_ENV !== "test") {
      this.app.use(
        morgan("combined", {
          stream: {
            write: (message: string) => {
              logger.info(message.trim());
            },
          },
        })
      );
    }

    // Body parsing middleware
    this.app.use(express.json({ limit: "100mb" }));
    this.app.use(express.urlencoded({ extended: true }));

    // Configurar trust proxy si está detrás de un proxy/load balancer
    this.app.set("trust proxy", 1);
  }

  private routes(): void {
    // API routes
    this.app.use("/api/v1", routes);

    // Root endpoint
    this.app.get("/", (req, res) => {
      res.json({
        success: true,
        message: "Welcome to SOPHIA Tutor Chat Service API",
        version: "1.0.0",
        endpoints: {
          health: "/api/v1/health",
        },
        documentation: "/api/docs", // Para futuro
        timestamp: new Date().toISOString(),
      });
    });
  }

  private errorHandling(): void {
    // 404 handler
    this.app.use(notFound);

    // Error handler
    this.app.use(errorHandler);
  }
}

export default new App().app;
