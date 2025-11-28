#!/bin/bash

# 🧪 Test Rápido con Gemini
# Prueba el Agent Loop usando Gemini (ya que tienes la API key configurada)

echo "🚀 Test Rápido del Agent Loop con Gemini"
echo "========================================="
echo ""

BASE_URL="http://localhost:3003/api/v1"

# Test 1: Pregunta simple
echo "📝 Test 1: Pregunta Simple"
echo "--------------------------"
echo "Prompt: 'What is your purpose?'"
curl -s -X POST ${BASE_URL}/ai/generate-course \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What is your purpose? Answer in one sentence without using tools.",
    "provider": "gemini",
    "model": "gemini-2.0-flash"
  }' | jq -r '"✅ Success: \(.success)\n📊 Iterations: \(.iterations)\n🔧 Tools: \(.toolsExecuted)\n💬 Response: \(.finalResponse)"'

echo ""
echo "---"
echo ""

# Test 2: Listar herramientas disponibles
echo "📝 Test 2: Consultar Herramientas Disponibles"
echo "---------------------------------------------"
echo "Prompt: 'List the tools you have'"
curl -s -X POST ${BASE_URL}/ai/generate-course \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Tell me what tools you have available. Just list their names and purpose, do not execute them.",
    "provider": "gemini",
    "model": "gemini-2.0-flash"
  }' | jq -r '"✅ Success: \(.success)\n📊 Iterations: \(.iterations)\n🔧 Tools Executed: \(.toolsExecuted)\n\n💬 Response:\n\(.finalResponse)"'

echo ""
echo "---"
echo ""

# Test 3: Intentar crear curso (puede fallar por el bug del CourseService)
echo "📝 Test 3: Intento de Crear Curso"
echo "----------------------------------"
echo "Prompt: 'Create a basic HTML course'"
echo "⚠️  Puede fallar por el bug del outputSchema en CourseService"
echo ""

RESPONSE=$(curl -s -X POST ${BASE_URL}/ai/generate-course \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a basic HTML course. Title: HTML Basics, Description: Learn HTML from scratch, Level: BEGINNER, Price: 0",
    "provider": "gemini",
    "model": "gemini-2.0-flash"
  }')

echo "$RESPONSE" | jq -r '"✅ Success: \(.success)\n📊 Iterations: \(.iterations)\n🔧 Tools Executed: \(.toolsExecuted)\n\n💬 Final Response:\n\(.finalResponse)\n"'

# Mostrar log de herramientas ejecutadas
TOOLS_COUNT=$(echo "$RESPONSE" | jq -r '.toolsExecuted // 0')
if [ "$TOOLS_COUNT" -gt 0 ]; then
    echo "📋 Log de Ejecución:"
    echo "$RESPONSE" | jq -r '.executionLog[]? | "  🔧 [\(.tool)]\n     Args: \(.args | to_entries | map("\(.key)=\(.value)") | join(", "))\n     Result: \(if .result.success then "✅ Success" else "❌ Error: \(.result.error // .result.data.message // "Unknown")" end)\n"'
fi

echo ""
echo "=================================="
echo "✅ Tests Completados"
echo "=================================="
