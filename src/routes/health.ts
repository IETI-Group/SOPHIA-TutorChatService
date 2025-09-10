import { Router, type IRouter } from "express";
import { getHealth } from "../controllers/healthController.js";

const router: IRouter = Router();

/**
 * @route   GET /health
 * @desc    Check if the service is running
 * @access  Public
 */
router.get("/", getHealth);

export default router;
