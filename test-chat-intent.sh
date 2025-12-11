#!/bin/bash

# 🧪 Test Chat Intent Detection
# Este script prueba la detección de intención "Crear Curso" en el chat normal

echo "🚀 SOPHIA Chat Intent Test"
echo "=========================="
echo ""

BASE_URL="http://localhost:3003/api/v1"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Scenario: User talks to AI, then asks to create the course${NC}"
echo ""

# Paso 1: Crear chat y discutir el curso
echo -e "${YELLOW}Step 1: Discussing course idea...${NC}"
RESPONSE=$(curl -s -X POST $BASE_URL/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Quiero diseñar un curso de Introducción a haskell. ¿Qué temas sugieres?",
    "model": "gemini-2.5-pro"
  }')

echo $RESPONSE | jq '.response'
CHAT_ID=$(echo $RESPONSE | jq -r '.chatId')

echo ""
echo "Chat ID: $CHAT_ID"
echo "---"
echo ""

# Paso 2: Trigger Creation
echo -e "${YELLOW}Step 2: Triggering Creation (The Magic Moment)${NC}"
echo "User says: 'Perfecto, por favor crear el curso ahora'"

curl -s -X POST $BASE_URL/ai/chat \
  -H "Content-Type: application/json" \
  -d "{
    \"chatId\": \"$CHAT_ID\",
    \"message\": \"Perfecto, me gusta la estructura. Por favor crear el curso de Introducción a React con 2 secciones: Fundamentos y Hooks. Cada una con 1 lección.\",
    \"model\": \"gemini-2.5-pro\"
  }" | jq '.'
