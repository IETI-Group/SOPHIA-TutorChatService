import { Router } from "express";
import { aiController } from "../controllers/ai.controller";

const router: Router = Router();

router.post("/chat", aiController.chat);
router.post("/course-assistant", aiController.generateCourseStructure);
router.post("/generate-course", aiController.generateCourseWithAgent);

export default router;
