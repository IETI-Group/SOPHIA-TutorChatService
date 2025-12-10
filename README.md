# SOPHIA TutorChatService

## Descripción del Proyecto

SOPHIA TutorChatService es un backend desarrollado en Node.js y TypeScript que forma parte del sistema SOPHIA (Sistema Operativo de Pedagogía Híbrida Inteligente y Adaptativa). Este servicio proporciona la funcionalidad de chat y tutoría virtual, facilitando la comunicación inteligente entre estudiantes y el sistema de tutoría automatizada.

El backend está diseñado con una arquitectura modular y escalable, implementando mejores prácticas de desarrollo como middleware de seguridad, manejo centralizado de errores, logging estructurado y testing automatizado.

### 🆕 Nuevas Características

#### 🤖 Agent Loop - Sistema Nervioso de IA
Sistema de ejecución autónoma de tareas complejas que permite a la IA (OpenAI/Gemini) ejecutar secuencialmente acciones en el MCP Server (CourseService):

- ✅ **Generación Automática de Cursos Completos**: La IA crea cursos, secciones, lecciones y contenido de forma autónoma
- ✅ **Function Calling Avanzado**: Integración con OpenAI y Gemini para ejecución de herramientas
- ✅ **Bucle de Razonamiento**: La IA toma decisiones basándose en resultados de acciones anteriores
- ✅ **Logging Detallado**: Seguimiento completo de todas las acciones ejecutadas

📖 [Documentación Completa del Agent Loop](./AGENT_LOOP.md) | [Quick Start](./AGENT_LOOP_QUICKSTART.md)

#### 🔌 MCP Client
Cliente para consumir recursos del MCP Server (SOPHIA CourseService):

- ✅ **10 Herramientas MCP**: Crear cursos, secciones, lecciones, y contenido
- ✅ **Streamable HTTP Transport**: Comunicación eficiente sin estado
- ✅ **REST API**: Endpoints para todas las operaciones MCP
- ✅ **Validación con Zod**: Validación de datos robusta

📖 [Documentación del MCP Client](./MCP_CLIENT_DOCUMENTATION.md) | [Quick Start](./MCP_CLIENT_README.md)

## Versión del Lenguaje

- **Node.js**: v24 
- **TypeScript**: v5.9.2
- **Target ES**: ES2022
- **Module System**: NodeNext 

## Dependencias

### Dependencias de Producción
- **express**: ^5.1.0 - Framework web para Node.js
- **cors**: ^2.8.5 - Middleware para habilitar CORS
- **helmet**: ^8.1.0 - Middleware de seguridad
- **morgan**: ^1.10.1 - Middleware de logging HTTP
- **winston**: ^3.17.0 - Logger estructurado
- **dotenv**: 17.2.2 - Manejo de variables de entorno
- **mongoose**: ^9.0.0 - ODM para MongoDB
- **ollama**: ^0.6.3 - Cliente para Ollama (LLMs locales)
- **openai**: ^6.9.1 - Cliente oficial de OpenAI
- **@google/generative-ai**: ^0.24.1 - Cliente oficial de Google Gemini
- **@modelcontextprotocol/sdk**: ^1.23.0 - SDK para Model Context Protocol
- **zod**: ^4.1.13 - Validación de esquemas TypeScript-first

### Dependencias de Desarrollo
- **@biomejs/biome**: 2.2.2 - Linter y formateador
- **vitest**: ^3.2.4 - Framework de testing
- **@vitest/coverage-istanbul**: 3.2.4 - Cobertura de código
- **nodemon**: 3.1.10 - Recarga automática en desarrollo
- **typescript**: 5.9.2 - Compilador TypeScript
- **typedoc**: 0.28.12 - Generador de documentación
- **supertest**: ^7.1.4 - Testing de APIs HTTP

## Instrucciones de Instalación y Ejecución

### Prerrequisitos
- Node.js v24 o superior
- pnpm 
- Docker 

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd SOPHIA-TutorChatService
   ```

2. **Instalar dependencias**
   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar el archivo .env con tus credenciales
   ```

   Variables requeridas:
   ```bash
   # Server
   PORT=3003
   
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/sophia-chat
   
   # AI Providers
   OLLAMA_HOST=http://localhost:11434
   OLLAMA_MODEL=llama3.2
   OPENAI_API_KEY=sk-...
   GEMINI_API_KEY=AIza...
   
   # MCP Server
   MCP_SERVER_URL=http://localhost:3000/mcp
   ```

### Scripts Disponibles

- **Desarrollo**:
  ```bash
  pnpm dev          # Ejecutar en modo desarrollo con nodemon
  ```

- **Producción**:
  ```bash
  pnpm build        # Compilar TypeScript
  pnpm start        # Ejecutar aplicación compilada
  ```

- **Testing**:
  ```bash
  pnpm test         # Ejecutar tests
  pnpm coverage     # Ejecutar tests con cobertura
  ```

- **Calidad de Código**:
  ```bash
  pnpm lint         
  pnpm format       
  pnpm check        
  ```

- **Documentación**:
  ```bash
  pnpm doc         
  ```

### Ejecución con Docker

#### Desarrollo
```bash
docker-compose -f docker-compose.dev.yml up
```

#### Producción
```bash
docker build -t sophia-tutor-chat-service .
docker run -p 3000:3000 sophia-tutor-chat-service
```

## Enlace al Documento de Planeación

📋 **Tablero de Planificación en Trello**: [SOPHIA Project Board](https://trello.com/invite/b/68be127bf45c3eaecf8cc70d/ATTI6891bb77d37b8e0184327426470801ed6871D57B/sophia)

En este tablero encontrarás:
- Backlog del producto
- Historias de usuario
- Tareas asignadas al equipo
- Progreso del desarrollo
- Sprints y entregas planificadas

## Estructura del Proyecto

```
src/
├── app.ts                 # Configuración principal de la aplicación
├── server.ts              # Punto de entrada del servidor
├── config/
│   └── env.ts            # Configuración de variables de entorno
├── controllers/          # Controladores de las rutas
│   ├── ai.controller.ts  # Controlador de IA (chat, agent loop)
│   ├── mcp.controller.ts # Controlador de MCP Client
│   └── healthController.ts
├── dtos/                 # Data Transfer Objects
│   ├── chat-request.dto.ts
│   └── course-assistant.dto.ts
├── middleware/           # Middlewares personalizados
│   └── errorHandler.ts
├── models/              # Modelos de MongoDB
│   └── chat.model.ts
├── routes/              # Definición de rutas
│   ├── ai.routes.ts     # POST /api/v1/ai/generate-course
│   ├── mcp.routes.ts    # Rutas MCP Client
│   └── index.ts
├── services/            # Lógica de negocio
│   ├── ai.service.ts    # 🆕 Agent Loop (OpenAI, Gemini)
│   ├── ai.utils.ts      # 🆕 Utilidades para mapeo de herramientas
│   ├── mcp.service.ts   # Servicio MCP de alto nivel
│   └── mcp/
│       ├── mcpClient.ts # Cliente MCP de bajo nivel
│       ├── types.ts     # Tipos TypeScript para MCP
│       └── index.ts
└── utils/               # Utilidades y tipos
    ├── logger.ts
    ├── validation.ts
    └── types.ts

test/                    # Tests automatizados
```

## 🚀 APIs Disponibles

### 🤖 AI & Agent Loop
- `POST /api/v1/ai/chat` - Chat tradicional con IA
- `POST /api/v1/ai/course-assistant` - Asistente de estructura de cursos
- `POST /api/v1/ai/generate-course` - 🆕 **Agent Loop**: Generar curso completo con IA

### 🔌 MCP Client
- `GET /api/v1/mcp/health` - Estado del MCP Server
- `GET /api/v1/mcp/tools` - Listar herramientas disponibles
- `POST /api/v1/mcp/courses` - Crear curso
- `GET /api/v1/mcp/courses` - Listar cursos
- `GET /api/v1/mcp/courses/:id` - Obtener curso por ID
- `POST /api/v1/mcp/courses/generate` - Generar curso completo
- `POST /api/v1/mcp/sections` - Crear sección
- `POST /api/v1/mcp/lessons` - Crear lección
- `POST /api/v1/mcp/lesson-content` - Crear contenido de lección

## 📖 Documentación Adicional

- **[AGENT_LOOP.md](./AGENT_LOOP.md)** - Documentación completa del Agent Loop con diagramas
- **[AGENT_LOOP_QUICKSTART.md](./AGENT_LOOP_QUICKSTART.md)** - Inicio rápido del Agent Loop
- **[MCP_CLIENT_DOCUMENTATION.md](./MCP_CLIENT_DOCUMENTATION.md)** - Documentación del MCP Client
- **[MCP_CLIENT_README.md](./MCP_CLIENT_README.md)** - Quick Start del MCP Client
- **[DOCKER.md](./DOCKER.md)** - Guía de Docker