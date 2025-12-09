export const env = {
    ollamaModel: process.env.OLLAMA_MODEL || "Llama2:7b-chat",
    ollamaHost: process.env.OLLAMA_HOST || "http://localhost:11434",
    openaiKey: process.env.OPENAI_API_KEY || "",
    geminiKey: process.env.GEMINI_API_KEY || "",
    mcpServerUrl: process.env.MCP_SERVER_URL || "http://localhost:3000/mcp",
    courseServiceUrl: process.env.COURSE_SERVICE_URL || "http://localhost:3000/api/v1",
    authServiceUrl: process.env.AUTH_SERVICE_URL || "http://localhost:3001/api/v1",
    serviceTimeout: Number(process.env.SERVICE_TIMEOUT) || 5000,
}