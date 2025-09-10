import { describe, expect, it, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("SOPHIA Tutor Char Service API", () => {
  describe("GET /", () => {
    it("should return welcome message", async () => {
      const response = await request(app).get("/").expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: "Welcome to SOPHIA Tutor Chat Service API",
        version: "1.0.0",
        endpoints: {
          health: "/api/v1/health",
        },
      });
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe("GET /api/v1/health", () => {
    it("should return health status", async () => {
      const response = await request(app).get("/api/v1/health").expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: "SOPHIA Tutor Chat Service is running successfully",
        service: "sophia-tutor-chat-service",
        version: "1.0.0",
      });

      expect(response.body.timestamp).toBeDefined();
      expect(response.body.environment).toBeDefined();
      expect(response.body.uptime).toBeDefined();
      expect(response.body.memory).toBeDefined();
      expect(response.body.memory.used).toBeTypeOf("number");
      expect(response.body.memory.total).toBeTypeOf("number");
    });
  });

  describe("GET /nonexistent", () => {
    it("should return 404 for nonexistent routes", async () => {
      const response = await request(app).get("/nonexistent").expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: "Not found - /nonexistent",
      });
    });
  });
});
