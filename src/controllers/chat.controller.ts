import type { Request, Response, NextFunction } from "express";
import { ChatModel } from "../models/chat.model.js";
import { aiService } from "../services/ai.service.js";

class ChatController {
  /**
   * Send a message to a chat
   * POST /api/v1/chats/message
   */
  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { chatId, message, model, context } = req.body;

      if (!message) {
        res.status(400).json({
          success: false,
          error: "Message is required",
        });
        return;
      }

      const result = await aiService.chat({
        chatId,
        message,
        model,
        context,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all chats
   * GET /api/v1/chats?type=chat|course
   */
  async listChats(req: Request, res: Response, next: NextFunction) {
    try {
      const { type } = req.query;
      const filter: any = {};
      
      if (type && (type === "chat" || type === "course")) {
        filter.chatType = type;
      }

      const chats = await ChatModel.find(filter)
        .select("_id createdAt updatedAt messages modelName chatType courseId")
        .sort({ updatedAt: -1 })
        .limit(100);

      res.json({
        success: true,
        count: chats.length,
        data: chats.map((chat) => ({
          chatId: chat._id,
          model: chat.modelName,
          chatType: chat.chatType,
          courseId: chat.courseId,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
          messageCount: chat.messages.length,
          lastMessage: chat.messages[chat.messages.length - 1]?.content?.substring(0, 100),
        })),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a specific chat by ID
   * GET /api/v1/chats/:id
   */
  async getChatById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const chat = await ChatModel.findById(id);

      if (!chat) {
        res.status(404).json({
          success: false,
          error: "Chat not found",
        });
        return;
      }

      res.json({
        success: true,
        data: {
          chatId: chat._id,
          model: chat.modelName,
          chatType: chat.chatType,
          courseId: chat.courseId,
          messages: chat.messages,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a chat by ID
   * DELETE /api/v1/chats/:id
   */
  async deleteChat(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const chat = await ChatModel.findByIdAndDelete(id);

      if (!chat) {
        res.status(404).json({
          success: false,
          error: "Chat not found",
        });
        return;
      }

      res.json({
        success: true,
        message: "Chat deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export const chatController = new ChatController();
