# 🚀 Quick Start: Agent Loop

## Inicio Rápido en 3 Pasos

### 1️⃣ Verifica que todo esté corriendo

```bash
# Terminal 1: CourseService (MCP Server)
cd ../SOPHIA-CourseService
pnpm dev

# Terminal 2: TutorChatService
cd ../SOPHIA-TutorChatService
pnpm dev

# Terminal 3: Verificar conexión
curl http://localhost:3003/api/v1/mcp/health
# Debe responder: {"success":true,"available":true}
```

### 2️⃣ Prueba el Agent Loop con OpenAI

```bash
curl -X POST http://localhost:3003/api/v1/ai/generate-course \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Crea un curso de Python para principiantes con 3 módulos: variables, funciones y listas",
    "provider": "openai",
    "model": "gpt-4o"
  }'
```

### 3️⃣ Prueba con Gemini

```bash
curl -X POST http://localhost:3003/api/v1/ai/generate-course \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Crea un curso de cocina italiana con recetas de pasta, pizza y risotto",
    "provider": "gemini",
    "model": "gemini-1.5-pro"
  }'
```

---

## 📦 Respuesta Esperada

```json
{
  "success": true,
  "provider": "openai",
  "finalResponse": "He creado exitosamente el curso 'Python para Principiantes' con 3 módulos y un total de 9 lecciones. El curso incluye:\n\n1. Variables y Tipos de Datos (3 lecciones)\n2. Funciones y Parámetros (3 lecciones)\n3. Listas y Estructuras de Datos (3 lecciones)\n\nCada lección incluye contenido educativo detallado.",
  "executionLog": [
    {
      "tool": "create_course",
      "args": {
        "title": "Python para Principiantes",
        "description": "Aprende Python desde cero",
        "level": "BEGINNER",
        "aiGenerated": true
      },
      "result": {
        "idCourse": "abc-123-def-456",
        "status": "DRAFT"
      }
    },
    {
      "tool": "create_section",
      "args": {
        "idCourse": "abc-123-def-456",
        "title": "Variables y Tipos de Datos",
        "order": 1
      },
      "result": {
        "idSection": "section-001"
      }
    }
    // ... más herramientas
  ],
  "iterations": 15,
  "toolsExecuted": 22
}
```

---

## 🎯 Ejemplos de Prompts

### Básico
```json
{
  "prompt": "Curso de HTML y CSS",
  "provider": "openai"
}
```

### Específico
```json
{
  "prompt": "Crea un curso de JavaScript con 5 secciones: sintaxis básica, funciones, arrays, objetos y DOM. Cada sección debe tener 3 lecciones con ejemplos prácticos.",
  "provider": "openai"
}
```

### Con Instructor
```json
{
  "prompt": "Curso avanzado de React con Hooks",
  "provider": "gemini",
  "instructorId": "instructor-uuid-789"
}
```

---

## 🔍 Ver los Logs en Tiempo Real

```bash
# En la terminal donde corre TutorChatService verás:
[AGENT LOOP - OpenAI] Iniciando generación de curso: "Crea un curso..."
[AGENT LOOP] Obteniendo herramientas del MCP Server...
[AGENT LOOP] 10 herramientas MCP disponibles
[AGENT LOOP] Iteración 1/20
[AGENT LOOP] La IA solicita ejecutar 1 herramientas
[MCP EXECUTION] Ejecutando create_course
[MCP EXECUTION] ✓ create_course ejecutado exitosamente
[AGENT LOOP] Iteración 2/20
[MCP EXECUTION] Ejecutando create_section
...
[AGENT LOOP] ✓ Proceso completado. La IA ha terminado.
```

---

## 🐛 Troubleshooting Rápido

### Error: "Connection refused"
```bash
# Verifica que CourseService esté corriendo
lsof -i :3000
```

### Error: "Unauthorized" o "API Key invalid"
```bash
# Verifica tus variables de entorno
cat .env | grep -E "(OPENAI|GEMINI)_API_KEY"
```

### Error: "Table does not exist"
```bash
# En CourseService, corre las migraciones
cd ../SOPHIA-CourseService
pnpm prisma migrate dev
```

---

## 📚 Más Información

- Documentación completa: [AGENT_LOOP.md](./AGENT_LOOP.md)
- Cliente MCP: [MCP_CLIENT_DOCUMENTATION.md](./MCP_CLIENT_DOCUMENTATION.md)
- Quick Start MCP: [MCP_CLIENT_README.md](./MCP_CLIENT_README.md)

---

**¡Listo para crear cursos con IA!** 🎉
