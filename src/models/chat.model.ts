import mongoose, { Schema, Document } from "mongoose";

export type Role = "user" | "assistant" | "system";

export interface ChatMessage {
  role: Role;
  content: string;
  model?: string;
  context?: number[];
  timestamp?: Date;
}

export interface ChatDocument extends Document {
  messages: ChatMessage[];
  modelName?: string; // Main model used in this chat
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<ChatMessage>(
  {
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, required: true },
    model: { type: String },
    context: { type: [Number] },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false },
);

const ChatSchema = new Schema<ChatDocument>(
  {
    messages: { type: [MessageSchema], default: [] },
    modelName: { type: String }, // Main model used in this chat
  },
  { timestamps: true },
);

export const ChatModel = mongoose.model<ChatDocument>("Chat", ChatSchema);
