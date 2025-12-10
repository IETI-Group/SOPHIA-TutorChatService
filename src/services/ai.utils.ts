/**
 * Convertir herramientas MCP (formato JSON Schema) al formato de OpenAI
 * @param mcpTools - Array de herramientas del MCP Server con inputSchema
 * @returns Array de herramientas en formato OpenAI
 */
export function mapMcpToolsToOpenAI(mcpTools: Array<{ name: string; description?: string | undefined; inputSchema?: any }>) {
  return mcpTools.map(tool => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description,
      // Usar el inputSchema del MCP o un schema vacío por defecto
      parameters: tool.inputSchema || {
        type: 'object' as const,
        properties: {},
        required: []
      }
    }
  }));
}

/**
 * Convertir herramientas MCP (formato JSON Schema) al formato de Gemini
 * @param mcpTools - Array de herramientas del MCP Server con inputSchema
 * @returns Array de herramientas en formato Gemini
 */
export function mapMcpToolsToGemini(mcpTools: Array<{ name: string; description?: string | undefined; inputSchema?: any }>) {
  return mcpTools.map(tool => {
    // Convertir el inputSchema de JSON Schema a formato Gemini
    const schema = tool.inputSchema || { type: 'object', properties: {} };
    
    return {
      name: tool.name,
      description: tool.description,
      parameters: {
        type: 'OBJECT' as const,
        properties: schema.properties || {},
        required: schema.required || []
      }
    };
  });
}

/**
 * Sistema de instrucciones para que la IA entienda cómo crear cursos
 */
export const COURSE_ARCHITECT_SYSTEM_PROMPT = `Eres un arquitecto de cursos experto en la plataforma SOPHIA.
Tu objetivo es crear cursos completos, detallados y estructurados usando las herramientas disponibles.

REGLAS ESTRICTAS:
1. Primero SIEMPRE crea el curso usando 'create_course'.
   - Si se proporciona un "Instructor ID" en el prompt, ÚSALO como 'instructorId'.
   - Si no, usa null.
2. GUARDA el 'idCourse' que te devuelve la herramienta (es un UUID).
3. Usa ese 'idCourse' para crear secciones con 'create_section'.
4. GUARDA el 'idSection' de cada sección que crees.
5. Para cada sección, crea lecciones usando 'create_lesson' con el 'idSection' correspondiente.
6. GUARDA el 'idLesson' de cada lección que crees.
7. Para cada lección, crea el contenido usando 'create_lesson_content' con el 'idLesson' correspondiente.
8. NO inventes IDs. Usa estrictamente los IDs devueltos por las herramientas anteriores.
9. NO preguntes confirmaciones. Ejecuta las acciones secuencialmente.
10. Si una herramienta falla, intenta continuar con el resto del flujo.

ESTRUCTURA RECOMENDADA:
- Para un curso básico: 3-5 secciones, 2-4 lecciones por sección
- Para un curso intermedio: 5-8 secciones, 3-5 lecciones por sección
- Para un curso avanzado: 8-12 secciones, 4-6 lecciones por sección

Cada lección debe tener contenido con:
- Contenido textual educativo
- Tipo apropiado (TEXT, VIDEO, QUIZ, etc.)
- Duración estimada en minutos`;
