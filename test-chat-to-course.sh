#!/bin/bash

# 🧪 Test Chat-to-Course Conversion
# Este script prueba la conversión de chats en cursos reales

echo "🚀 SOPHIA Chat-to-Course Conversion Test"
echo "=========================================="
echo ""

BASE_URL="http://localhost:3003/api/v1"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test 1: Conversión del Chat de Cocina Italiana
echo -e "${YELLOW}Test 1: Convert Italian Cooking Chat to Real Course${NC}"
echo ""
echo -e "${BLUE}Simulating the chat message you showed...${NC}"
echo ""

curl -X POST $BASE_URL/chat-to-course/convert \
  -H "Content-Type: application/json" \
  -d '{
    "chatId": "6925e265fd1349adb80e7cbf",
    "userPrompt": "Quiero hacer un curso de cocina",
    "assistantMessage": "Course Title: \"Quiero Hacer un Curso de Cocina\" (I Want to Make a Cooking Course)\n\nCourse Description: This course is designed to teach beginners the fundamentals of cooking and culinary techniques, with a focus on creating delicious and healthy meals. Students will learn about different cooking methods, ingredient selection, and food safety practices. By the end of the course, students will be able to prepare a variety of dishes and understand the principles of proper nutrition.\n\nCourse Sections:\n\nSection 1: Introduction to Cooking (Lessons 1-2)\n\n* Lesson 1: Understanding the Basics of Cooking\n\t+ Topic 1: Measuring and Mixing Ingredients\n\t+ Topic 2: Cooking Terminology\n\t+ Assessment: Completing a simple recipe using basic cooking techniques\n* Lesson 2: Food Safety and Sanitation\n\t+ Topic 1: Understanding Foodborne Illnesses\n\t+ Topic 2: Safe Food Handling Practices\n\t+ Assessment: Identifying common food safety mistakes and their solutions\n\nSection 2: Cooking Methods and Techniques (Lessons 3-6)\n\n* Lesson 3: Boiling and Steaming\n\t+ Topic 1: Understanding Boiling and Steaming\n\t+ Topic 2: Preparing a Simple Meal using Boiling or Steaming\n\t+ Assessment: Demonstrating proper use of cooking equipment and techniques\n* Lesson 4: Grilling and Roasting\n\t+ Topic 1: Understanding Grilling and Roasting Techniques\n\t+ Topic 2: Preparing a Simple Meal using Grilling or Roasting\n\t+ Assessment: Demonstrating proper use of cooking equipment and techniques\n* Lesson 5: Sauteing and Stir-Frying\n\t+ Topic 1: Understanding Sauteing and Stir-Frying Techniques\n\t+ Topic 2: Preparing a Simple Meal using Sauteing or Stir-Frying\n\t+ Assessment: Demonstrating proper use of cooking equipment and techniques\n* Lesson 6: Baking and Desserts\n\t+ Topic 1: Understanding Baking and Dessert Techniques\n\t+ Topic 2: Preparing a Simple Dessert using Baking or Dessert Techniques\n\t+ Assessment: Demonstrating proper use of baking equipment and techniques\n\nSection 3: Advanced Culinary Techniques (Lessons 7-9)\n\n* Lesson 7: Sauces and Marinades\n\t+ Topic 1: Understanding Sauce and Marinade Preparation\n\t+ Topic 2: Preparing a Simple Sauce or Marinade\n\t+ Assessment: Demonstrating proper use of sauce and marinade preparation techniques\n* Lesson 8: Working with Leftovers and Food Safety\n\t+ Topic 1: Understanding How to Use Leftovers Effectively\n\t+ Topic 2: Identifying Common Food Safety Mistakes and their Solutions\n\t+ Assessment: Demonstrating proper use of leftovers and food safety practices\n* Lesson 9: Special Diets and Allergen Awareness\n\t+ Topic 1: Understanding Special Dietary Needs and Restrictions\n\t+ Topic 2: Identifying Common Food Allergies and Their Signs and Symptoms\n\t+ Assessment: Demonstrating proper use of special dietary considerations and food allergy awareness",
    "provider": "gemini",
    "model": "gemini-2.0-flash"
  }' | jq '.'

echo ""
echo "---"
echo ""

# Test 2: Conversión con Batch
echo -e "${YELLOW}Test 2: Batch Convert Multiple Chats${NC}"
echo ""

curl -X POST $BASE_URL/chat-to-course/batch \
  -H "Content-Type: application/json" \
  -d '{
    "chats": [
      {
        "chatId": "chat-001",
        "userPrompt": "Quiero aprender Python",
        "assistantMessage": "Course Title: Python Programming for Beginners\n\nSection 1: Python Basics\n* Lesson 1: Variables and Data Types\n* Lesson 2: Control Flow\n\nSection 2: Functions and Modules\n* Lesson 1: Defining Functions\n* Lesson 2: Using Modules"
      },
      {
        "chatId": "chat-002",
        "userPrompt": "Curso de fotografía",
        "assistantMessage": "Course Title: Photography Fundamentals\n\nSection 1: Camera Basics\n* Lesson 1: Understanding Your Camera\n* Lesson 2: Exposure Triangle\n\nSection 2: Composition\n* Lesson 1: Rule of Thirds\n* Lesson 2: Leading Lines"
      }
    ],
    "provider": "gemini",
    "model": "gemini-2.0-flash"
  }' | jq '.'

echo ""
echo "---"
echo ""

echo -e "${GREEN}✅ Test Complete!${NC}"
echo ""
echo "📊 Check the results above to see:"
echo "  - Course IDs created"
echo "  - Sections and lessons generated"
echo "  - Agent Loop execution details"
echo "  - Number of tools executed"
