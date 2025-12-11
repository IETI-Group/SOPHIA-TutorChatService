import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

export async function connectDatabase(): Promise<void> {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    logger.warn("MONGO_URI not set; skipping MongoDB connection");
    return;
  }

  try {
    await mongoose.connect(uri);
    logger.info("Connected to MongoDB");
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    throw error;
  }
}
