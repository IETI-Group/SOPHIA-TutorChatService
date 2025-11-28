# MCP Client - Quick Start Guide

## Descripción

Cliente MCP (Model Context Protocol) que permite consumir los recursos del servidor MCP de SOPHIA Course Service para crear y gestionar cursos de forma programática.

## Instalación

Las dependencias ya están instaladas:
```bash
pnpm install
```

## Configuración

Agrega en tu `.env`:

```env
# URL del servidor MCP de SOPHIA Course Service
MCP_SERVER_URL=http://localhost:3000/mcp
```

## Inicio Rápido

### 1. Verificar que el servidor MCP esté corriendo

Asegúrate de que el servidor MCP de SOPHIA Course Service esté ejecutándose en `http://localhost:3000/mcp`

### 2. Iniciar este servicio

```bash
pnpm dev
```

### 3. Verificar la conexión

```bash
# Health check del servicio MCP
curl http://localhost:3003/api/v1/mcp/health

# Listar herramientas disponibles
curl http://localhost:3003/api/v1/mcp/tools
```

## Ejemplos de Uso

### Generar un curso completo con IA

```bash
curl -X POST http://localhost:3003/api/v1/mcp/courses/generate \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introducción a Python",
    "description": "Aprende Python desde cero",
    "level": "BEGINNER",
    "numberOfSections": 3
  }'
```

### Crear un curso manualmente

```bash
curl -X POST http://localhost:3003/api/v1/mcp/courses \
  -H "Content-Type: application/json" \
  -d '{
    "instructorId": null,
    "title": "JavaScript Avanzado",
    "description": "Domina JavaScript moderno",
    "price": 49.99,
    "level": "ADVANCED",
    "aiGenerated": false
  }'
```

### Listar cursos

```bash
# Todos los cursos
curl http://localhost:3003/api/v1/mcp/courses

# Solo cursos generados por IA
curl "http://localhost:3003/api/v1/mcp/courses?aiGenerated=true"

# Cursos de nivel BEGINNER
curl "http://localhost:3003/api/v1/mcp/courses?level=BEGINNER"
```

### Crear una sección

```bash
curl -X POST http://localhost:3003/api/v1/mcp/sections \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "TU-COURSE-ID-AQUI",
    "title": "Fundamentos de Python",
    "description": "Conceptos básicos de Python",
    "order": 1,
    "aiGenerated": true
  }'
```

## Endpoints Disponibles

- `GET /api/v1/mcp/health` - Estado del servicio MCP
- `GET /api/v1/mcp/tools` - Herramientas disponibles
- `POST /api/v1/mcp/courses/generate` - Generar curso completo
- `POST /api/v1/mcp/courses` - Crear curso
- `GET /api/v1/mcp/courses` - Listar cursos
- `GET /api/v1/mcp/courses/:id` - Obtener curso por ID
- `POST /api/v1/mcp/sections` - Crear sección
- `POST /api/v1/mcp/lessons` - Crear lección
- `POST /api/v1/mcp/lesson-content` - Crear contenido de lección

## Arquitectura

```
TutorChatService (Puerto 3003)
    ↓
MCP Client (Streamable HTTP)
    ↓
SOPHIA Course Service MCP Server (Puerto 3000)
    ↓
Base de Datos (PostgreSQL/MongoDB)
```

## Integración con AI Chat

Puedes usar el servicio MCP dentro de conversaciones con IA:

```typescript
import { mcpService } from './services/mcp.service.js';

// En un controlador o servicio
async function handleCourseCreation(userMessage: string) {
  // El AI procesa el mensaje del usuario
  // y extrae los parámetros del curso
  
  const result = await mcpService.generateCompleteCourse({
    title: extractedTitle,
    description: extractedDescription,
    level: extractedLevel,
    numberOfSections: 3
  });
  
  return result;
}
```

## Solución de Problemas

### Error: "MCP connection failed"

**Solución:**
1. Verifica que el servidor MCP esté corriendo: `curl http://localhost:3000/mcp`
2. Revisa la variable `MCP_SERVER_URL` en `.env`
3. Asegúrate de que no haya firewall bloqueando el puerto 3000

### Error: "Tool not found"

**Solución:**
1. Lista las herramientas disponibles: `curl http://localhost:3003/api/v1/mcp/tools`
2. Verifica que estés usando el nombre correcto de la herramienta
3. Asegúrate de que el servidor MCP esté actualizado

### Error de validación

**Solución:**
1. Revisa el formato del JSON en tu petición
2. Asegúrate de incluir todos los campos requeridos
3. Verifica los tipos de datos (strings, numbers, booleans)

## Documentación Completa

Ver [MCP_CLIENT_DOCUMENTATION.md](./MCP_CLIENT_DOCUMENTATION.md) para documentación detallada.

## Referencias

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [SOPHIA Course Service](https://github.com/tu-org/sophia-course-service)
