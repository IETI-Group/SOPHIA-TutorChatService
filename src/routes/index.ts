import { Router, type IRouter } from "express";
import healthRoutes from "./health.js";
import aiRoutes from "./ai.routes";
import chatRoutes from "./chat.routes.js";

const router: IRouter = Router();

// Rutas de la aplicación
router.use("/health", healthRoutes);
router.use("/ai", aiRoutes);
router.use("/chats", chatRoutes);
// Aquí se pueden agregar más rutas en el futuro
// router.use('/users', userRoutes);
// router.use('/auth', authRoutes);

export default router;
