#!/bin/bash

# 🧪 Agent Loop - Simple Test
# Este script prueba que el Agent Loop esté funcionando correctamente
# incluso si algunas herramientas del MCP Server tienen problemas

echo "🔍 Agent Loop - Verification Test"
echo "=================================="
echo ""

BASE_URL="http://localhost:3003/api/v1"

# Test 1: Verificar que la IA recibe los schemas
echo "Test 1: Verificar que las herramientas incluyen schemas"
echo "-------------------------------------------------------"
TOOLS=$(curl -s ${BASE_URL}/mcp/tools)
echo "$TOOLS" | jq -r '.data[0] | "Tool: \(.name)\nDescription: \(.description)"'
echo ""

# Test 2: Probar que el Agent Loop itera correctamente
echo "Test 2: Verificar que el Agent Loop ejecuta iteraciones"
echo "--------------------------------------------------------"
echo "Prompt: 'What tools do you have available?'"
curl -X POST ${BASE_URL}/ai/generate-course \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What tools do you have available for course creation? Just list them.",
    "provider": "gemini",
    "model": "gemini-2.0-flash"
  }' 2>/dev/null | jq -r '"Iterations: \(.iterations)\nTools Executed: \(.toolsExecuted)\nResponse: \(.finalResponse)"'
echo ""
echo "---"
echo ""

# Test 3: Verificar que la IA entiende los parámetros necesarios
echo "Test 3: Verificar que la IA conoce los parámetros de create_course"
echo "-------------------------------------------------------------------"
echo "Prompt: 'Tell me what parameters are needed to create a course'"
curl -X POST ${BASE_URL}/ai/generate-course \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Tell me what parameters are required for the create_course tool. Just describe them, dont execute it.",
    "provider": "gemini",
    "model": "gemini-2.0-flash"
  }' 2>/dev/null | jq -r '"Response: \(.finalResponse)"'
echo ""
echo "---"
echo ""

echo "✅ Verification Complete!"
echo ""
echo "📊 Expected Results:"
echo "  - Test 1: Should show tool name and description"
echo "  - Test 2: Should show 0-2 iterations (IA just lists tools without executing)"
echo "  - Test 3: Should list required parameters: instructorId, title, description, price, level"
echo ""
echo "📝 Note: If create_course has schema errors in the MCP Server,"
echo "   that's a CourseService issue, not an Agent Loop issue."
