import { Router, type IRouter } from "express";
import healthRoutes from "./health.js";

const router: IRouter = Router();

// Rutas de la aplicación
router.use("/health", healthRoutes);

// Aquí se pueden agregar más rutas en el futuro
// router.use('/users', userRoutes);
// router.use('/auth', authRoutes);

export default router;
