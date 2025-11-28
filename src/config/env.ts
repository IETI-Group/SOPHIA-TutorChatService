export const env = {
    ollamaModel: process.env.OLLAMA_MODEL || "Llama2:7b-chat",
    ollamaHost: process.env.OLLAMA_HOST || "http://localhost:11434",
    mcpServerUrl: process.env.MCP_SERVER_URL || "http://localhost:3000/mcp",
}