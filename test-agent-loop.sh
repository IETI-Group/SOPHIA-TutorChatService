#!/bin/bash

# 🧪 Agent Loop Test Suite
# Este script prueba el Agent Loop con Gemini (gemini-2.0-flash)

echo "🚀 SOPHIA Agent Loop - Test Suite"
echo "=================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Variables
BASE_URL="http://localhost:3003/api/v1"

# Test 1: Health Check
echo -e "${YELLOW}Test 1: MCP Health Check${NC}"
curl -s http://localhost:3003/api/v1/mcp/health | jq '.'
echo ""
echo "---"
echo ""

# Test 2: List MCP Tools
echo -e "${YELLOW}Test 2: List Available MCP Tools${NC}"
curl -s http://localhost:3003/api/v1/mcp/tools | jq '.'
echo ""
echo "---"
echo ""

# Test 3: Simple Course with Gemini
echo -e "${YELLOW}Test 3: Generate Simple Course with Gemini${NC}"
echo "Prompt: 'Create a basic HTML course with 2 sections'"
curl -X POST http://localhost:3003/api/v1/ai/generate-course \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a basic HTML course with 2 sections: Introduction to HTML and HTML Forms",
    "provider": "gemini",
    "model": "gemini-2.0-flash"
  }' | jq '.'
echo ""
echo "---"
echo ""

# Test 4: Complex Course with Gemini
echo -e "${YELLOW}Test 4: Generate Complex Course with Gemini${NC}"
echo "Prompt: 'Create a JavaScript course with 3 modules'"
curl -X POST http://localhost:3003/api/v1/ai/generate-course \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a JavaScript course for beginners with 3 modules: Variables & Data Types, Functions, and Objects & Arrays. Each module should have 3 lessons.",
    "provider": "gemini",
    "model": "gemini-2.0-flash"
  }' | jq '.'
echo ""
echo "---"
echo ""

# Test 5: Natural Language Prompt in Spanish
echo -e "${YELLOW}Test 5: Natural Language Prompt (Spanish)${NC}"
echo "Prompt: 'Necesito un curso de cocina italiana'"
curl -X POST http://localhost:3003/api/v1/ai/generate-course \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Necesito un curso de cocina italiana con recetas básicas. Debe incluir pasta, pizza y risotto.",
    "provider": "gemini",
    "model": "gemini-2.0-flash"
  }' | jq '.'
echo ""
echo "---"
echo ""

# Test 6: With Instructor ID
echo -e "${YELLOW}Test 6: Generate Course with Instructor ID${NC}"
curl -X POST http://localhost:3003/api/v1/ai/generate-course \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a Python programming course for data science",
    "provider": "gemini",
    "model": "gemini-2.0-flash",
    "instructorId": "instructor-123-abc"
  }' | jq '.'
echo ""
echo "---"
echo ""

# Test 7: List Created Courses
echo -e "${YELLOW}Test 7: List All Created Courses${NC}"
curl -s http://localhost:3000/api/v1/courses | jq '.'
echo ""
echo "---"
echo ""

echo -e "${GREEN}✅ Test Suite Complete!${NC}"
echo ""
echo "📊 Review the execution logs to see:"
echo "  - How many iterations the AI took"
echo "  - Which tools were executed"
echo "  - What arguments were used"
echo "  - What results were returned"
