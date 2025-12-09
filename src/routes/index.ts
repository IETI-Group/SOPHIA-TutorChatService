import { Router, type IRouter } from "express";
import healthRoutes from "./health.js";
import aiRoutes from "./ai.routes";
import chatRoutes from "./chat.routes.js";
import mcpRoutes from "./mcp.routes.js";
import chatToCourseRoutes from "./chat-to-course.routes";
import auth from "./auth.routes.js";
import { authenticate } from "../middleware/auth";

const router: IRouter = Router();

// Rutas públicas (sin autenticación)
router.use('/auth', auth);
router.use("/health", healthRoutes);

// Rutas protegidas (requieren autenticación)
router.use("/ai", authenticate, aiRoutes);
router.use("/chats", authenticate, chatRoutes);
router.use("/mcp", authenticate, mcpRoutes);
router.use("/chat-to-course", authenticate, chatToCourseRoutes);

// Aquí se pueden agregar más rutas en el futuro
// router.use('/users', userRoutes);
// router.use('/auth', authRoutes);

export default router;
