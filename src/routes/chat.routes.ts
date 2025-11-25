import { Router } from "express";
import { chatController } from "../controllers/chat.controller.js";

const router: Router = Router();

router.get("/", chatController.listChats);
router.get("/:id", chatController.getChatById);
router.delete("/:id", chatController.deleteChat);

export default router;
