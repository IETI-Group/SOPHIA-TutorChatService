import mongoose, { Schema, Document } from "mongoose";

export type ChatType = "chat" | "course";

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
  chatType: ChatType; // Type of chat: regular chat or course generation
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
    chatType: { type: String, enum: ["chat", "course"], default: "chat" },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual property to access modelName as 'model' for convenience
ChatSchema.virtual('model').get(function() {
  return this.modelName;
});

export const ChatModel = mongoose.model<ChatDocument>("Chat", ChatSchema);
