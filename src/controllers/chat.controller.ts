import type { Request, Response, NextFunction } from "express";
import { ChatModel } from "../models/chat.model.js";

export class ChatController {
  /**
   * Get all chats
   * GET /api/v1/chats
   */
  async listChats(req: Request, res: Response, next: NextFunction) {
    try {
      const chats = await ChatModel.find()
        .select("_id createdAt updatedAt messages")
        .sort({ updatedAt: -1 })
        .limit(100);

      res.json({
        success: true,
        count: chats.length,
        data: chats.map((chat) => ({
          chatId: chat._id,
          model: chat.get('model'),
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
          model: chat.get('model'),
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
