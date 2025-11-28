# 📝 Chat-to-Course Integration

## 🎯 Objetivo

Convertir las conversaciones de chat (generadas por Llama2) en **cursos reales** en la base de datos usando el **Agent Loop + MCP**.

## 🔄 Flujo Completo

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐      ┌──────────┐
│   Usuario   │─────▶│ Chat (Llama2)│─────▶│ Agent Loop  │─────▶│ MCP Tools│
│             │      │              │      │   (Gemini)  │      │          │
│ "Quiero un  │      │  Estructura  │      │             │      │ create_  │
│  curso de   │      │  del curso   │      │  Convierte  │      │ course   │
│  cocina"    │      │  (texto)     │      │  a comandos │      │ section  │
│             │      │              │      │             │      │ lesson   │
└─────────────┘      └──────────────┘      └─────────────┘      └──────────┘
                                                                       │
                                                                       ▼
                                                              ┌─────────────────┐
                                                              │ Base de Datos   │
                                                              │ (Curso Real)    │
                                                              └─────────────────┘
```

## 🚀 Nuevo Endpoint

### `POST /api/v1/chat-to-course/convert`

Convierte un chat individual en un curso real.

**Request Body:**
```json
{
  "chatId": "6925e265fd1349adb80e7cbf",
  "userPrompt": "Quiero hacer un curso de cocina",
  "assistantMessage": "Course Title: \"Quiero Hacer un Curso de Cocina\"...",
  "instructorId": "instructor-123" // opcional
  "provider": "gemini", // o "openai"
  "model": "gemini-2.0-flash" // o "gpt-4o"
}
```

**Response:**
```json
{
  "success": true,
  "chatId": "6925e265fd1349adb80e7cbf",
  "provider": "gemini",
  "course": {
    "courseId": "uuid-del-curso",
    "title": "Quiero Hacer un Curso de Cocina",
    "level": "BEGINNER",
    "price": 29.99,
    "sectionsCreated": 3,
    "lessonsCreated": 9,
    "creationDetails": {
      "course": {...},
      "sections": [...],
      "lessons": [...]
    }
  },
  "agentExecution": {
    "iterations": 12,
    "toolsExecuted": 13,
    "finalResponse": "Course created successfully with 3 sections and 9 lessons"
  },
  "executionLog": [...]
}
```

### `POST /api/v1/chat-to-course/batch`

Convierte múltiples chats en batch.

**Request Body:**
```json
{
  "chats": [
    {
      "chatId": "chat-001",
      "userPrompt": "...",
      "assistantMessage": "...",
      "instructorId": "instructor-001"
    },
    {
      "chatId": "chat-002",
      "userPrompt": "...",
      "assistantMessage": "...",
      "instructorId": "instructor-002"
    }
  ],
  "provider": "gemini",
  "model": "gemini-2.0-flash"
}
```

## 🧠 Cómo Funciona

### 1. **Chat genera estructura** (ya lo tienes)
```
Usuario: "Quiero un curso de cocina"
Llama2: [Genera estructura detallada del curso en texto]
```

### 2. **Backend convierte a curso real** (nuevo)
```typescript
// Tu backend recibe el chat
POST /api/v1/chat-to-course/convert
{
  chatId: "...",
  assistantMessage: "Course Title: ... Section 1: ..."
}

// Agent Loop lo procesa
Agent Loop analiza el texto
↓
Identifica: título, secciones, lecciones
↓
Ejecuta MCP tools en orden:
  1. create_course → obtiene courseId
  2. create_section (3 veces) → obtiene sectionIds
  3. create_lesson (9 veces) → crea lecciones
↓
Retorna curso completo creado
```

### 3. **Resultado**
- ✅ Curso real en base de datos
- ✅ Todas las secciones creadas
- ✅ Todas las lecciones creadas
- ✅ Estructura preservada
- ✅ Log completo de ejecución

## 📊 Ejemplo Real

### Input (tu chat):
```json
{
  "chatId": "6925e265fd1349adb80e7cbf",
  "userPrompt": "Quiero hacer un curso de cocina",
  "assistantMessage": "Course Title: Quiero Hacer un Curso de Cocina\n\nSection 1: Introduction to Cooking\n* Lesson 1: Basics\n* Lesson 2: Safety\n\nSection 2: Cooking Methods\n* Lesson 3: Boiling\n...",
  "instructorId": "instructor-001"
}
```

### Output (curso creado):
```json
{
  "success": true,
  "course": {
    "courseId": "abc-123-def",
    "title": "Quiero Hacer un Curso de Cocina",
    "sectionsCreated": 3,
    "lessonsCreated": 9
  },
  "agentExecution": {
    "iterations": 12,
    "toolsExecuted": 13
  }
}
```

## 🧪 Testing

```bash
# Test de conversión individual
./test-chat-to-course.sh

# O manualmente
curl -X POST http://localhost:3003/api/v1/chat-to-course/convert \
  -H "Content-Type: application/json" \
  -d '{
    "chatId": "test-001",
    "userPrompt": "Quiero un curso de Python",
    "assistantMessage": "Course Title: Python for Beginners...",
    "provider": "gemini",
    "model": "gemini-2.0-flash"
  }'
```

## 🔧 Integración con tu Frontend

### Opción 1: Conversión Automática
```typescript
// Después de que Llama2 genera la respuesta
const chatResponse = await generateChatResponse(userPrompt);

// Inmediatamente convertir a curso real
const course = await fetch('/api/v1/chat-to-course/convert', {
  method: 'POST',
  body: JSON.stringify({
    chatId: chat.id,
    userPrompt: userPrompt,
    assistantMessage: chatResponse.content,
    instructorId: currentUser.id,
    provider: 'gemini',
    model: 'gemini-2.0-flash'
  })
});

// Mostrar al usuario: "✅ Curso creado exitosamente"
```

### Opción 2: Conversión Manual
```typescript
// Mostrar botón "Crear Curso Real" en el chat
<button onClick={() => convertChatToCourse(chat)}>
  📚 Crear Curso Real
</button>

// Al hacer clic, llamar al endpoint
async function convertChatToCourse(chat) {
  const response = await fetch('/api/v1/chat-to-course/convert', {
    method: 'POST',
    body: JSON.stringify({
      chatId: chat.id,
      userPrompt: chat.messages[0].content,
      assistantMessage: chat.messages[1].content,
      instructorId: currentUser.id
    })
  });
  
  const result = await response.json();
  // Redirigir a /courses/{result.course.courseId}
}
```

### Opción 3: Batch Processing
```typescript
// Convertir múltiples chats guardados
const savedChats = await fetchUserChats();

const result = await fetch('/api/v1/chat-to-course/batch', {
  method: 'POST',
  body: JSON.stringify({
    chats: savedChats.map(chat => ({
      chatId: chat.id,
      userPrompt: chat.messages[0].content,
      assistantMessage: chat.messages[1].content,
      instructorId: currentUser.id
    })),
    provider: 'gemini'
  })
});

// Mostrar: "✅ 5 cursos creados exitosamente"
```

## 🎯 Ventajas

1. **Separación de responsabilidades**
   - Llama2 = Genera ideas y estructura (rápido, económico)
   - Gemini + MCP = Ejecuta acciones reales (preciso, confiable)

2. **Conversión inteligente**
   - El Agent Loop interpreta el texto y decide qué tools usar
   - Maneja estructuras variables automáticamente
   - Reintenta si hay errores

3. **Trazabilidad**
   - Log completo de qué se creó y cómo
   - Puedes mostrar al usuario: "Se crearon 3 secciones y 9 lecciones"

4. **Flexibilidad**
   - Conversión individual o batch
   - Automática o manual (con botón)
   - Soporta OpenAI y Gemini

## 🔍 Monitoreo

El endpoint retorna información detallada:
- ✅ IDs de curso, secciones y lecciones creadas
- ✅ Número de iteraciones del Agent Loop
- ✅ Cantidad de tools ejecutados
- ✅ Log completo de ejecución

Esto te permite:
- Detectar errores específicos
- Optimizar prompts
- Monitorear costos (iteraciones = API calls)
- Depurar conversiones fallidas

## 🚦 Próximos Pasos

1. **Ejecutar el test**
   ```bash
   ./test-chat-to-course.sh
   ```

2. **Verificar en la base de datos**
   ```bash
   curl http://localhost:3000/api/v1/courses | jq '.data[] | {title, sectionsCreated}'
   ```

3. **Integrar en tu frontend**
   - Agregar botón "Crear Curso Real"
   - Mostrar progress bar durante conversión
   - Redirigir a curso creado

4. **Optimizar**
   - Ajustar prompts según resultados
   - Implementar retry logic
   - Agregar validaciones específicas
