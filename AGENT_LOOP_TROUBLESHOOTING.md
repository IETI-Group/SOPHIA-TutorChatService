# 🔧 Agent Loop - Troubleshooting Guide

## Problema Actual: "data must NOT have additional properties"

### Descripción del Error

Cuando la IA intenta llamar a `create_course`, recibe el error:
```
MCP error -32602: Structured content does not match the tool's output schema: 
data must NOT have additional properties
```

### Causa Raíz

Este error proviene del **MCP Server (CourseService)** y ocurre cuando:
1. La respuesta del servidor incluye campos que no están definidos en el `outputSchema` de la herramienta
2. El schema de salida es muy estricto y no permite campos adicionales

### Soluciones

#### Opción 1: Modificar el MCP Server (CourseService)
En el MCP Server, asegúrate de que el `outputSchema` de la herramienta `create_course` incluya todos los campos que devuelve:

```typescript
// En SOPHIA-CourseService
outputSchema: z.object({
  idCourse: z.string(),
  title: z.string(),
  description: z.string(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  price: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  // Agregar TODOS los campos que el endpoint devuelve
})
```

O usar un schema más permisivo:
```typescript
outputSchema: z.record(z.unknown()) // Permite cualquier campo
```

#### Opción 2: Modificar la Respuesta del Endpoint
En el CourseService, filtra la respuesta para devolver solo los campos del schema:

```typescript
// Devolver solo campos permitidos
return {
  idCourse: course.idCourse,
  title: course.title,
  // ... solo campos del outputSchema
};
```

#### Opción 3: Workaround Temporal (Agent Loop)
Puedes modificar `executeMcpTool` para manejar estos errores y continuar:

```typescript
// En src/services/ai.service.ts
private async executeMcpTool(toolName: string, toolArgs: any): Promise<any> {
  try {
    switch (toolName) {
      case 'create_course':
        return await mcpService.createCourse(toolArgs);
      // ... resto de casos
    }
  } catch (error) {
    // Si es error de schema, intentar extraer los datos útiles
    if (error.message.includes('additional properties')) {
      logger.warn('Schema mismatch, but tool may have succeeded');
      return { 
        warning: 'Tool executed but response schema mismatch',
        originalError: error.message 
      };
    }
    throw error;
  }
}
```

### Estado Actual

El Agent Loop está **funcionando correctamente** en términos de:
- ✅ Conexión con MCP Server
- ✅ Obtención de herramientas con schemas
- ✅ Mapeo de herramientas a formato OpenAI/Gemini
- ✅ Bucle de ejecución (iteraciones)
- ✅ Logging detallado

El problema está en el **MCP Server (CourseService)**, no en el TutorChatService.

### Verificación

Para verificar que el Agent Loop funciona con otras herramientas, prueba:

```bash
# Probar list_courses (no debería tener el error de schema)
curl -X POST http://localhost:3003/api/v1/ai/generate-course \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "List all courses in the platform",
    "provider": "openai"
  }'
```

### Próximos Pasos

1. **Revisar CourseService**: Verificar los `outputSchema` de todas las herramientas MCP
2. **Ajustar Schemas**: Asegurarse de que coincidan con las respuestas reales
3. **Probar de Nuevo**: Una vez arreglado en CourseService, el Agent Loop funcionará perfectamente

---

**Actualizado**: November 27, 2025  
**Estado**: Agent Loop implementado correctamente, esperando fix en CourseService
