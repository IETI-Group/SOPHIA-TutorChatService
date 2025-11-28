# 🧠 Agent Loop: El Sistema Nervioso de SOPHIA

## 📚 Tabla de Contenidos
- [Introducción](#-introducción)
- [El Problema que Resuelve](#-el-problema-que-resuelve)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Cómo Funciona el Bucle](#-cómo-funciona-el-bucle)
- [Implementación](#-implementación)
- [Ejemplos de Uso](#-ejemplos-de-uso)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Introducción

El **Agent Loop** es el "sistema nervioso" que conecta tu IA (el cerebro) con el MCP Server (el cuerpo). Permite que la IA ejecute acciones secuenciales de forma autónoma para completar tareas complejas.

### La Analogía
- 🧠 **Cerebro (IA)**: GPT-4, Gemini, etc. - Piensa y decide qué hacer
- 💪 **Cuerpo (MCP Server/CourseService)**: Ejecuta acciones reales en la base de datos
- 🔌 **Sistema Nervioso (Agent Loop)**: Transmite las intenciones del cerebro al cuerpo y viceversa

---

## ❓ El Problema que Resuelve

### Sin Agent Loop
```
Usuario: "Crea un curso de Python"
IA: "Para crear un curso necesitas llamar a la API POST /courses..."
Usuario: 😤 (Frustración - solo obtienes sugerencias)
```

### Con Agent Loop
```
Usuario: "Crea un curso de Python"
IA: 🤔 (Piensa) → Necesito create_course
     ↓
Tu Código: 🔧 (Ejecuta) → Llama al MCP Server
     ↓
MCP Server: ✅ (Responde) → {id: "course-123"}
     ↓
Tu Código: 📨 (Devuelve a la IA) → "Curso creado con ID course-123"
     ↓
IA: 🤔 (Piensa) → Ahora necesito create_section para course-123
     ↓
Tu Código: 🔧 (Ejecuta) → Llama al MCP Server
     ↓
... (El ciclo continúa hasta completar todo)
     ↓
IA: ✅ "Curso completo creado con 3 secciones y 12 lecciones"
Usuario: 🎉 (Satisfacción)
```

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                      USUARIO                             │
│           "Crea un curso de Python básico"              │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────┐
│              TutorChatService (Port 3003)               │
│                                                          │
│  ┌────────────────────────────────────────────────┐   │
│  │     Controller: /api/v1/ai/generate-course     │   │
│  │  • Recibe prompt del usuario                    │   │
│  │  • Valida provider (openai/gemini)              │   │
│  └────────────────┬───────────────────────────────┘   │
│                   │                                      │
│                   ↓                                      │
│  ┌────────────────────────────────────────────────┐   │
│  │    AI Service: generateCourseWithOpenAI()      │   │
│  │                                                  │   │
│  │  🧠 BUCLE DEL AGENTE (Agent Loop)              │   │
│  │  ┌──────────────────────────────────────┐     │   │
│  │  │ while (!finished && loops < 20) {    │     │   │
│  │  │   1. IA piensa qué herramienta usar  │     │   │
│  │  │   2. Código ejecuta herramienta MCP  │     │   │
│  │  │   3. Código devuelve resultado a IA  │     │   │
│  │  │   4. IA decide siguiente paso        │     │   │
│  │  │ }                                     │     │   │
│  │  └──────────────────────────────────────┘     │   │
│  │                                                  │   │
│  │  Componentes:                                   │   │
│  │  • mapMcpToolsToOpenAI() - Traduce herramientas│   │
│  │  • OpenAI API - Genera intenciones             │   │
│  │  • mcpService.callTool() - Ejecuta acciones    │   │
│  └────────────────┬───────────────────────────────┘   │
│                   │                                      │
└───────────────────┼──────────────────────────────────────┘
                    │
                    ↓ HTTP POST
┌─────────────────────────────────────────────────────────┐
│         MCPClient (Streamable HTTP Transport)           │
│  • Traduce llamadas a protocolo MCP                     │
│  • Envía JSON-RPC sobre HTTP                            │
└────────────────┬────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────┐
│            CourseService MCP Server (Port 3000)         │
│  • Recibe tool_name y arguments                         │
│  • Ejecuta lógica de negocio                            │
│  • Guarda en PostgreSQL                                 │
│  • Retorna resultados (IDs, estados, etc.)              │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Cómo Funciona el Bucle

### Flujo Paso a Paso

#### 1️⃣ Preparación
```typescript
// Tu código obtiene las herramientas del MCP
const tools = await mcpService.listAvailableTools();
// → [create_course, create_section, create_lesson, ...]

// Tu código las traduce al formato de la IA
const openAiTools = mapMcpToolsToOpenAI(tools);
```

#### 2️⃣ Primera Iteración
```typescript
// La IA recibe el prompt del usuario
messages = [
  { role: 'system', content: 'Eres un arquitecto de cursos...' },
  { role: 'user', content: 'Crea un curso de Python básico' }
];

// La IA responde con una intención
response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: messages,
  tools: openAiTools
});

// La IA decidió:
response.choices[0].message.tool_calls = [
  {
    id: 'call_123',
    function: {
      name: 'create_course',
      arguments: '{"title": "Python Básico", "level": "BEGINNER"}'
    }
  }
];
```

#### 3️⃣ Ejecución de Herramienta
```typescript
// Tu código detecta que la IA quiere ejecutar una herramienta
for (const toolCall of response.tool_calls) {
  // Tu código actúa como intermediario
  const result = await mcpService.callTool(
    'create_course', 
    { title: 'Python Básico', level: 'BEGINNER' }
  );
  
  // El MCP Server responde
  // result = { idCourse: 'course-abc-123', status: 'DRAFT' }
  
  // Tu código le devuelve el resultado a la IA
  messages.push({
    tool_call_id: 'call_123',
    role: 'tool',
    name: 'create_course',
    content: JSON.stringify(result)
  });
}
```

#### 4️⃣ Segunda Iteración
```typescript
// La IA recibe el resultado y piensa de nuevo
response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: messages, // Ahora incluye el resultado anterior
  tools: openAiTools
});

// La IA decidió:
response.choices[0].message.tool_calls = [
  {
    id: 'call_456',
    function: {
      name: 'create_section',
      arguments: '{"idCourse": "course-abc-123", "title": "Introducción", "order": 1}'
    }
  }
];

// El ciclo se repite...
```

#### 5️⃣ Finalización
```typescript
// Después de varias iteraciones, la IA responde sin tool_calls
response.choices[0].message.tool_calls = undefined;
response.choices[0].message.content = 
  "He creado el curso 'Python Básico' con 3 secciones y 10 lecciones...";

// Tu código detecta que terminó y devuelve la respuesta final
return {
  success: true,
  finalResponse: response.content,
  toolsExecuted: 15,
  iterations: 8
};
```

---

## 💻 Implementación

### Archivos Creados

#### 1. `src/services/ai.utils.ts`
Contiene las funciones de traducción de herramientas:
- `mapMcpToolsToOpenAI()` - Convierte herramientas MCP → Formato OpenAI
- `mapMcpToolsToGemini()` - Convierte herramientas MCP → Formato Gemini
- `COURSE_ARCHITECT_SYSTEM_PROMPT` - Instrucciones para la IA

#### 2. `src/services/ai.service.ts`
Contiene los métodos del Agent Loop:
- `generateCourseWithOpenAI()` - Bucle para OpenAI/GPT-4
- `generateCourseWithGemini()` - Bucle para Google Gemini

#### 3. `src/controllers/ai.controller.ts`
Endpoint HTTP:
- `generateCourseWithAgent()` - POST `/api/v1/ai/generate-course`

#### 4. `src/routes/ai.routes.ts`
Registro de rutas

---

## 🚀 Ejemplos de Uso

### Ejemplo 1: Curso Básico con OpenAI

**Request:**
```bash
curl -X POST http://localhost:3003/api/v1/ai/generate-course \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Crea un curso de JavaScript para principiantes con 3 secciones: variables, funciones y objetos",
    "provider": "openai",
    "model": "gpt-4o"
  }'
```

**Response:**
```json
{
  "success": true,
  "provider": "openai",
  "finalResponse": "He creado exitosamente el curso 'JavaScript para Principiantes'...",
  "executionLog": [
    {
      "tool": "create_course",
      "args": {
        "title": "JavaScript para Principiantes",
        "level": "BEGINNER",
        "aiGenerated": true
      },
      "result": {
        "idCourse": "course-xyz-789",
        "status": "DRAFT"
      }
    },
    {
      "tool": "create_section",
      "args": {
        "idCourse": "course-xyz-789",
        "title": "Variables y Tipos de Datos",
        "order": 1
      },
      "result": {
        "idSection": "section-001"
      }
    },
    {
      "tool": "create_lesson",
      "args": {
        "idSection": "section-001",
        "title": "¿Qué es una variable?",
        "order": 1
      },
      "result": {
        "idLesson": "lesson-001"
      }
    }
    // ... más herramientas ejecutadas
  ],
  "iterations": 12,
  "toolsExecuted": 15
}
```

### Ejemplo 2: Curso Avanzado con Gemini

**Request:**
```bash
curl -X POST http://localhost:3003/api/v1/ai/generate-course \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Crea un curso avanzado de Machine Learning con PyTorch. Debe tener 5 módulos: Introducción a Redes Neuronales, CNNs, RNNs, GANs y Transformers. Cada módulo debe tener 4 lecciones prácticas.",
    "provider": "gemini",
    "model": "gemini-1.5-pro",
    "instructorId": "instructor-uuid-456"
  }'
```

**Response:**
```json
{
  "success": true,
  "provider": "gemini",
  "finalResponse": "Curso completo de Machine Learning creado...",
  "executionLog": [
    // ... registro de 50+ herramientas ejecutadas
  ],
  "iterations": 18,
  "toolsExecuted": 56
}
```

### Ejemplo 3: Prompt Natural en Español

**Request:**
```bash
curl -X POST http://localhost:3003/api/v1/ai/generate-course \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Necesito un curso de cocina italiana. Quiero que tenga recetas básicas como pasta, pizza y risotto. Cada receta debe explicar los ingredientes y el paso a paso.",
    "provider": "openai"
  }'
```

La IA interpretará y creará:
- Curso: "Cocina Italiana para Principiantes"
- Sección 1: "Pasta Casera"
- Sección 2: "Pizza Artesanal"
- Sección 3: "Risotto Perfecto"
- Lecciones: "Ingredientes", "Preparación", "Cocción", "Presentación"

---

## 🔧 Configuración Necesaria

### Variables de Entorno

Asegúrate de tener en tu `.env`:

```bash
# MCP Server
MCP_SERVER_URL=http://localhost:3000/mcp

# OpenAI
OPENAI_API_KEY=sk-...

# Gemini
GEMINI_API_KEY=AIza...
```

### Verificar que el MCP Server esté corriendo

```bash
# Verificar CourseService
curl http://localhost:3000/mcp/health

# Verificar que las herramientas estén disponibles
curl http://localhost:3003/api/v1/mcp/tools
```

---

## 🐛 Troubleshooting

### Problema 1: "Connection refused to MCP Server"

**Síntoma:**
```json
{
  "success": false,
  "error": "Agent Loop Error (OpenAI): ECONNREFUSED"
}
```

**Solución:**
1. Verifica que CourseService esté corriendo: `lsof -i :3000`
2. Verifica la variable de entorno: `echo $MCP_SERVER_URL`

### Problema 2: "Maximum iterations reached"

**Síntoma:**
```json
{
  "success": false,
  "error": "Límite de iteraciones alcanzado",
  "iterations": 20
}
```

**Causas posibles:**
- El prompt es demasiado ambiguo
- La IA no puede completar la tarea con las herramientas disponibles
- Hay un error en el MCP Server que causa reintentos

**Solución:**
1. Revisa los logs: `executionLog` te muestra qué herramientas se ejecutaron
2. Simplifica el prompt o hazlo más específico
3. Verifica que todas las herramientas MCP funcionen correctamente

### Problema 3: "Invalid tool arguments"

**Síntoma:**
```json
{
  "tool": "create_lesson",
  "result": {
    "error": true,
    "message": "idSection is required"
  }
}
```

**Causa:**
La IA no está usando correctamente los IDs devueltos por herramientas anteriores.

**Solución:**
1. Mejora el `COURSE_ARCHITECT_SYSTEM_PROMPT` con ejemplos más claros
2. Verifica que el modelo sea lo suficientemente capaz (usa GPT-4 en lugar de GPT-3.5)

### Problema 4: La IA no ejecuta herramientas

**Síntoma:**
```json
{
  "finalResponse": "Para crear un curso debes llamar a la API...",
  "toolsExecuted": 0
}
```

**Causa:**
El `tool_choice` está en `none` o las herramientas no se mapearon correctamente.

**Solución:**
1. Verifica que `tool_choice: 'auto'` esté configurado
2. Revisa que `mapMcpToolsToOpenAI()` devuelva el formato correcto
3. Prueba con un prompt más directo: "Ejecuta create_course con título X"

---

## 📊 Métricas y Monitoreo

El Agent Loop devuelve información útil para analizar el rendimiento:

```typescript
{
  success: true,
  finalResponse: "...",
  executionLog: [...],    // Ver qué se ejecutó
  iterations: 12,         // Cuántas vueltas dio el bucle
  toolsExecuted: 18       // Total de herramientas usadas
}
```

### Interpretación

- **iterations < 5**: Tarea simple (crear solo el curso)
- **iterations 5-15**: Tarea mediana (curso + secciones)
- **iterations > 15**: Tarea compleja (curso completo con contenido)

---

## 🎓 Conceptos Clave

### Function Calling vs Chat Normal

| Aspecto | Chat Normal | Function Calling (Agent Loop) |
|---------|-------------|-------------------------------|
| IA responde con | Texto | Texto **O** intención de herramienta |
| Tu código hace | Mostrar respuesta | Ejecutar acción + continuar bucle |
| Ejemplo | "Para crear un curso..." | `{tool_call: "create_course", args: {...}}` |

### Por qué se llama "Bucle"

```typescript
while (!finished) {
  // 1. IA piensa
  const aiResponse = await callAI(messages);
  
  // 2. Si quiere herramienta, ejecutamos
  if (aiResponse.tool_calls) {
    for (const tool of aiResponse.tool_calls) {
      const result = await executeTool(tool);
      messages.push(result);
    }
    // ← Aquí vuelve al while (bucle)
  } else {
    // 3. Si no quiere herramienta, terminamos
    finished = true;
  }
}
```

---

## 🔮 Próximos Pasos

1. **Persistencia de Conversaciones**: Guardar el `executionLog` en MongoDB para auditoría
2. **Streaming**: Enviar actualizaciones en tiempo real al frontend
3. **Validación Inteligente**: Antes de ejecutar una herramienta, validar que los IDs existan
4. **Rollback**: Si una herramienta falla, deshacer cambios anteriores
5. **Costos**: Trackear tokens consumidos por iteración

---

## 📚 Referencias

- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)
- [Gemini Function Calling](https://ai.google.dev/gemini-api/docs/function-calling)
- [Model Context Protocol Spec](https://spec.modelcontextprotocol.io/)
- [MCP Client Documentation](./MCP_CLIENT_DOCUMENTATION.md)

---

**¡Felicidades!** 🎉 Ahora tienes un sistema completo de Agent Loop que permite que tu IA ejecute acciones reales de forma autónoma.
