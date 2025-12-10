# Documentación de la API del Servicio de IA

Esta documentación detalla cómo configurar, ejecutar y utilizar los servicios de Inteligencia Artificial integrados en SOPHIA Coordinator.

---

## 🔐 Autenticación

Todos los endpoints (excepto `/health` y `/auth`) requieren autenticación mediante token JWT.

**Header requerido:**
```
Authorization: Bearer <token>
```

**Ejemplo:**
```bash
curl -X POST http://localhost:3003/api/v1/ai/chat \
  -H "Authorization: Bearer eyJraWQiOiI1S2VpK2p3d0JuRUxL..." \
  -H "Content-Type: application/json" \
  -d '{"message":"Hola"}'
```

**Errores de Autenticación:**

| Código | Error | Descripción |
|--------|-------|-------------|
| 401 | UNAUTHORIZED | Token no proporcionado o inválido |

**Respuesta (401):**
```json
{
  "success": false,
  "message": "No authorization token provided",
  "error": "UNAUTHORIZED"
}
```

---

## 📡 Endpoints de la API

URL Base: `/api/v1/ai`

### 1. Chat con IA

Permite interactuar con el modelo de IA. Todos los mensajes se guardan automáticamente en la base de datos.

**Endpoint:** `POST /chat`

#### Cuerpo de la Petición (Request Body)

| Campo | Tipo | Requerido | Descripción |
|-------|------|----------|-------------|
| `message` | string | Sí | El mensaje actual que se envía a la IA. |
| `model` | string | No | El modelo de IA a utilizar (ej: `gpt-3.5-turbo`, `gemini-pro`, `Llama2:7b-chat`). Si no se envía, usa el configurado por defecto. |
| `context` | number[] | No | Array de números (tokens) que representa el historial de la conversación (solo para Ollama). |
| `chatId` | string | No | ID de un chat existente para continuar la conversación. Si no se envía, se crea un nuevo chat. |

#### Ejemplo de Petición (Nuevo Chat)

```json
{
  "message": "Hola, ¿cómo puedo estructurar un curso de Python?",
  "model": "gpt-3.5-turbo" // Opcional
}
```

#### Ejemplo de Petición (Continuar Chat)

```json
{
  "message": "¿Y qué temas debería incluir?",
  "chatId": "6924ee716f476c51e6fc51df"
}
```

#### Respuesta Exitosa

**Código:** `200 OK`

```json
{
  "success": true,
  "chatId": "6924ee716f476c51e6fc51df",
  "response": "Texto de la respuesta...",
  "context": [1, 2, 3, ...] // Solo para modelos Ollama
}
```

#### Notas Importantes

**Sobre el `chatId`:**
- Cuando envías el primer mensaje sin `chatId`, el sistema crea un nuevo chat y devuelve un `chatId`.
- Guarda este `chatId` en tu aplicación cliente para continuar la conversación.
- Envía el mismo `chatId` en las siguientes peticiones para mantener el historial.
- Todos los mensajes (usuario y asistente) se guardan automáticamente en la base de datos.

**Sobre el `context` (solo Ollama):**
- Solo los modelos de Ollama usan el array numérico `context` para mantener el historial.
- Para OpenAI y Gemini, el historial se reconstruye automáticamente desde la base de datos.
- Si cambias de modelo dentro de la misma conversación, el `context` numérico no es compatible entre modelos diferentes.

**Modelos Soportados:**
- **Ollama**: `Llama2:7b-chat`, `deepseek-r1:7b`
- **OpenAI**: `gpt-3.5-turbo`, `gpt-4`
- **Google Gemini**: `gemini-2.0-flash`

#### Ejemplo de Flujo Completo

**Paso 1: Primera Pregunta (Sin chatId)**
```bash
curl -X POST http://localhost:3003/api/v1/ai/chat \
  -H "Authorization: Bearer eyJraWQiOiI1S2VpK2p3d0JuRUxL..." \
  -H "Content-Type: application/json" \
  -d '{"message":"¿Por qué el cielo es azul?"}'
```

**Respuesta:**
```json
{
  "success": true,
  "chatId": "6924ee716f476c51e6fc51df",
  "response": "El cielo es azul debido a la dispersión de Rayleigh...",
  "context": [123, 456, 789, ...]
}
```

**Paso 2: Segunda Pregunta (Con chatId para continuar)**
```bash
curl -X POST http://localhost:3003/api/v1/ai/chat \
  -H "Authorization: Bearer eyJraWQiOiI1S2VpK2p3d0JuRUxL..." \
  -H "Content-Type: application/json" \
  -d '{"message":"¿Y por qué se pone rojo al atardecer?","chatId":"6924ee716f476c51e6fc51df"}'
```

**Respuesta:**
```json
{
  "success": true,
  "chatId": "6924ee716f476c51e6fc51df",
  "response": "Al atardecer, la luz recorre más distancia...",
  "context": [123, 456, 789, 1011, 1213, ...]
}
```

#### Respuesta de Error

**Código:** `400 Bad Request`
```json
{
  "success": false,
  "error": "Missing required field: message",
  "timestamp": "2023-10-27T10:00:00.000Z"
}
```

---

### 🎯 Creación Automática de Cursos (Agent Loop)

El endpoint de chat incluye una funcionalidad de **detección de intención** que permite crear cursos automáticamente cuando el usuario lo solicita explícitamente.

#### ¿Cómo Funciona?

1. **Conversación Normal**: El usuario conversa con la IA sobre el curso que desea crear (temas, estructura, nivel, etc.)
2. **Trigger de Creación**: Cuando el usuario está listo, envía un mensaje con una frase de activación
3. **Agent Loop**: El sistema ejecuta automáticamente el bucle de agente que crea el curso, secciones, lecciones y contenido en el Course Service
4. **Cambio de Tipo**: El chat se marca automáticamente como `chatType: "course"` y se guarda el `courseId`

#### Frases de Activación (Triggers)

El sistema detecta las siguientes frases para iniciar la creación del curso:

- `"crear el curso"` / `"create the course"`
- `"generar el curso"` / `"generate the course"`
- `"crear curso"` / `"create course"`
- `"haz el curso"` / `"make the course"`
- `"construir el curso"` / `"build the course"`
- `"implementar el curso"`

#### Ejemplo de Flujo Completo

**Paso 1: Discutir la idea del curso**
```bash
curl -X POST http://localhost:3003/api/v1/ai/chat \
  -H "Authorization: Bearer eyJraWQiOiI1S2VpK2p3d0JuRUxL..." \
  -H "Content-Type: application/json" \
  -d '{"message": "Quiero crear un curso de introducción a Java"}'
```

**Respuesta:**
```json
{
  "success": true,
  "chatId": "6924ee716f476c51e6fc51df",
  "response": "¡Excelente idea! Un curso de Java es muy valioso. Te sugiero incluir los siguientes temas..."
}
```

**Paso 2: Refinar la estructura**
```bash
curl -X POST http://localhost:3003/api/v1/ai/chat \
  -H "Authorization: Bearer eyJraWQiOiI1S2VpK2p3d0JuRUxL..." \
  -H "Content-Type: application/json" \
  -d '{"message": "Me gustaría que tenga 3 secciones: fundamentos, POO y proyectos prácticos", "chatId": "6924ee716f476c51e6fc51df"}'
```

**Paso 3: Solicitar la creación (Trigger)**
```bash
curl -X POST http://localhost:3003/api/v1/ai/chat \
  -H "Authorization: Bearer eyJraWQiOiI1S2VpK2p3d0JuRUxL..." \
  -H "Content-Type: application/json" \
  -d '{"message": "Perfecto, por favor crear el curso ahora", "chatId": "6924ee716f476c51e6fc51df"}'
```

**Respuesta (con Agent Loop):**
```json
{
  "success": true,
  "chatId": "6924ee716f476c51e6fc51df",
  "response": "¡Entendido! He iniciado la creación del curso basado en nuestra conversación.\n\n✅ **Curso Creado Exitosamente**\n\n📊 **Resumen:**\n- **ID del Curso:** eadd33af-36e4-429a-baf7-b963dc2aaa88\n- **Secciones creadas:** 3\n- **Lecciones creadas:** 9\n\n...",
  "context": [],
  "agentExecution": {
    "success": true,
    "finalResponse": "El curso ha sido creado exitosamente...",
    "executionLog": [
      {
        "tool": "create_course",
        "args": { "title": "Introducción a Java", "level": "BEGINNER", ... },
        "result": { "success": true, "data": { "idCourse": "eadd33af-36e4-429a-baf7-b963dc2aaa88", ... } }
      },
      {
        "tool": "create_section",
        "args": { "courseId": "eadd33af-36e4-429a-baf7-b963dc2aaa88", "title": "Fundamentos", ... },
        "result": { "success": true, "data": { "idSection": "34c42b87-f81a-47a2-9134-5dbb1f5a0315", ... } }
      }
      // ... más herramientas ejecutadas
    ],
    "iterations": 15,
    "toolsExecuted": 15
  }
}
```

#### Cambios en el Chat Después de la Creación

Cuando se crea un curso exitosamente, el documento del chat se actualiza con:

| Campo | Valor | Descripción |
|-------|-------|-------------|
| `chatType` | `"course"` | Indica que este chat resultó en la creación de un curso |
| `courseId` | `"eadd33af-..."` | ID del curso creado en el Course Service |

#### Consultar Chats con Cursos Creados

```bash
# Listar solo chats que tienen cursos creados
curl http://localhost:3003/api/v1/chats?type=course
```

**Respuesta:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "chatId": "6924ee716f476c51e6fc51df",
      "model": "gemini-2.0-flash",
      "chatType": "course",
      "courseId": "eadd33af-36e4-429a-baf7-b963dc2aaa88",
      "createdAt": "2025-12-03T10:00:00.000Z",
      "updatedAt": "2025-12-03T10:05:00.000Z",
      "messageCount": 6,
      "lastMessage": "¡Entendido! He iniciado la creación del curso..."
    }
  ]
}
```

#### Obtener Detalle de un Chat con Curso

```bash
curl http://localhost:3003/api/v1/chats/6924ee716f476c51e6fc51df
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "chatId": "6924ee716f476c51e6fc51df",
    "model": "gemini-2.0-flash",
    "chatType": "course",
    "courseId": "eadd33af-36e4-429a-baf7-b963dc2aaa88",
    "messages": [
      { "role": "user", "content": "Quiero crear un curso de introducción a Java", ... },
      { "role": "assistant", "content": "¡Excelente idea!...", ... },
      { "role": "user", "content": "Perfecto, por favor crear el curso ahora", ... },
      { "role": "assistant", "content": "¡Entendido! He iniciado la creación...", "model": "gemini-2.0-flash", ... }
    ],
    "createdAt": "2025-12-03T10:00:00.000Z",
    "updatedAt": "2025-12-03T10:05:00.000Z"
  }
}
```

#### Notas Importantes

- El Agent Loop utiliza **Gemini 2.0 Flash** independientemente del modelo con el que se estaba conversando, ya que es el único que soporta function calling para las herramientas MCP.
- El campo `agentExecution` en la respuesta contiene todo el log de ejecución del Agent Loop, útil para debugging.
- Si el Agent Loop falla parcialmente, el `courseId` se guardará igualmente si al menos el curso fue creado.

---

## 📚 Gestión de Historial de Chats

URL Base: `/api/v1/chats`

### 3. Listar Todos los Chats

Obtiene una lista de todos los chats guardados en la base de datos.

**Endpoint:** `GET /chats`

#### Parámetros de Query (Opcionales)

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `type` | string | Filtrar por tipo de chat: `chat` (conversaciones regulares) o `course` (generación de cursos) |

#### Respuesta Exitosa

**Código:** `200 OK`

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "chatId": "6924ee716f476c51e6fc51df",
      "model": "Llama2:7b-chat",
      "chatType": "chat",
      "courseId": null,
      "createdAt": "2025-11-24T23:47:04.596Z",
      "updatedAt": "2025-11-24T23:47:23.002Z",
      "messageCount": 4,
      "lastMessage": "La capital de Francia es París."
    },
    {
      "chatId": "6924ee716f476c51e6fc51e0",
      "model": "gemini-2.0-flash",
      "chatType": "course",
      "courseId": "eadd33af-36e4-429a-baf7-b963dc2aaa88",
      "createdAt": "2025-11-24T23:50:00.000Z",
      "updatedAt": "2025-11-24T23:50:15.000Z",
      "messageCount": 6,
      "lastMessage": "¡Entendido! He iniciado la creación del curso..."
    }
  ]
}
```

#### Ejemplos de Petición

```bash
# Listar todos los chats
curl http://localhost:3003/api/v1/chats

# Listar solo chats regulares
curl http://localhost:3003/api/v1/chats?type=chat

# Listar solo chats de generación de cursos
curl http://localhost:3003/api/v1/chats?type=course
```

---

### 4. Obtener Historial de un Chat

Obtiene el historial completo de mensajes de un chat específico.

**Endpoint:** `GET /chats/:id`

#### Parámetros de URL

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | string | ID del chat a consultar |

#### Respuesta Exitosa

**Código:** `200 OK`

```json
{
  "success": true,
  "data": {
    "chatId": "6924ee716f476c51e6fc51df",
    "model": "Llama2:7b-chat",
    "chatType": "chat",
    "courseId": null,
    "messages": [
      {
        "role": "user",
        "content": "Hola, ¿cómo estás?",
        "model": "Llama2:7b-chat",
        "timestamp": "2025-11-24T23:46:57.017Z"
      },
      {
        "role": "assistant",
        "content": "Hola! Estoy bien, gracias por preguntar.",
        "model": "Llama2:7b-chat",
        "context": [123, 456, ...],
        "timestamp": "2025-11-24T23:47:04.592Z"
      }
    ],
    "createdAt": "2025-11-24T23:47:04.596Z",
    "updatedAt": "2025-11-24T23:47:23.002Z"
  }
}
```

> **Nota:** Para chats de tipo `course`, el campo `courseId` contendrá el ID del curso creado en el Course Service.

#### Respuesta de Error

**Código:** `404 Not Found`
```json
{
  "success": false,
  "error": "Chat not found"
}
```

#### Ejemplo de Petición

```bash
curl http://localhost:3003/api/v1/chats/6924ee716f476c51e6fc51df
```

---

### 5. Eliminar un Chat

Elimina permanentemente un chat y todo su historial.

**Endpoint:** `DELETE /chats/:id`

#### Parámetros de URL

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | string | ID del chat a eliminar |

#### Respuesta Exitosa

**Código:** `200 OK`

```json
{
  "success": true,
  "message": "Chat deleted successfully"
}
```

#### Respuesta de Error

**Código:** `404 Not Found`
```json
{
  "success": false,
  "error": "Chat not found"
}
```

#### Ejemplo de Petición

```bash
curl -X DELETE http://localhost:3003/api/v1/chats/6924ee716f476c51e6fc51df
```

---

### 2. Asistente de Cursos

Genera un esquema de curso estructurado y profesional basado en una idea y pautas de estilo. Todos los cursos generados se guardan automáticamente en la base de datos con el tipo `course`.

**Endpoint:** `POST /course-assistant`

#### Cuerpo de la Petición

| Campo | Tipo | Requerido | Descripción |
|-------|------|----------|-------------|
| `idea` | string | Sí | El concepto central o tema del curso. |
| `guide` | string | Sí | Pautas estructurales, audiencia objetivo o requisitos específicos. |
| `model` | string | No | El modelo de IA a utilizar (ej: `Llama2:7b-chat`, `deepseek-r1:7b`, `gemini-2.0-flash`). Si no se envía, usa el configurado por defecto. |
| `chatId` | string | No | ID de un chat de curso existente para continuar refinando el curso. |

#### Ejemplo de Petición (Nuevo Curso)

```json
{
  "idea": "Introducción a la Programación en Python para Ciencia de Datos",
  "guide": "La audiencia objetivo son principiantes. Incluir 4 módulos principales. Enfocarse en ejemplos prácticos.",
  "model": "Llama2:7b-chat"
}
```

#### Ejemplo de Petición (Refinar Curso Existente)

```json
{
  "idea": "Agregar más ejercicios prácticos al módulo 2",
  "guide": "Ejercicios hands-on con datasets reales",
  "chatId": "6924ee716f476c51e6fc51e0"
}
```

#### Respuesta Exitosa

**Código:** `200 OK`

```json
{
  "success": true,
  "chatId": "6924ee716f476c51e6fc51e0",
  "response": "Título del Curso: Python para Ciencia de Datos\n\nMódulo 1: Fundamentos de Python\n- Lección 1.1: Instalación y Configuración\n- Lección 1.2: Variables y Tipos de Datos..."
}
```

#### Notas Importantes

- Los cursos generados se guardan con `chatType: "course"` para distinguirlos de chats regulares.
- Puedes continuar refinando un curso existente usando el `chatId` devuelto.
- Para ver todos los cursos generados: `GET /api/v1/chats?type=course`
- Para ver el historial completo de un curso: `GET /api/v1/chats/:chatId`

#### Ejemplo de Flujo Completo

```bash
# 1. Generar curso inicial
curl -X POST http://localhost:3003/api/v1/ai/course-assistant \
  -H "Authorization: Bearer eyJraWQiOiI1S2VpK2p3d0JuRUxL..." \
  -H "Content-Type: application/json" \
  -d '{
    "idea": "Curso de Machine Learning",
    "guide": "Nivel intermedio, 6 semanas, incluir proyectos"
  }'

# Respuesta incluye chatId
# {"success": true, "chatId": "abc123...", "response": "..."}

# 2. Refinar el curso
curl -X POST http://localhost:3003/api/v1/ai/course-assistant \
  -H "Authorization: Bearer eyJraWQiOiI1S2VpK2p3d0JuRUxL..." \
  -H "Content-Type: application/json" \
  -d '{
    "idea": "Añadir más contenido sobre redes neuronales",
    "guide": "Profundizar en CNNs y RNNs",
    "chatId": "abc123..."
  }'

# 3. Ver historial del curso
curl -H "Authorization: Bearer eyJraWQiOiI1S2VpK2p3d0JuRUxL..." \
  http://localhost:3003/api/v1/chats/abc123...
```

#### Respuesta de Error

**Código:** `400 Bad Request`
```json
{
  "success": false,
  "error": "Missing required field: idea",
  "timestamp": "2023-10-27T10:00:00.000Z"
}
```


## 🛠️ Prerrequisitos y Configuración

### Proveedores de IA Soportados

El servicio soporta tres proveedores de IA:

1. **Ollama** (Local) - Para modelos open-source ejecutados localmente
2. **OpenAI** - Para GPT-3.5, GPT-4 y variantes
3. **Google Gemini** - Para modelos Gemini Pro y Flash

### 1. Configurar Ollama (Opcional)

Si deseas usar modelos locales con Ollama:

#### Instalar Ollama
- **Descargar:** Visita [ollama.com](https://ollama.com) y descarga la versión para tu sistema operativo.
- **Instalar:** Sigue las instrucciones del instalador.

#### Descargar Modelos
Descarga los modelos que desees usar:

```bash
ollama pull Llama2:7b-chat
ollama pull llama3.2
ollama pull mistral
```

#### Verificar que Ollama está corriendo
Antes de usar modelos de Ollama, asegúrate de que esté activo:
```bash
curl http://127.0.0.1:11434
```

### 2. Configuración de Variables de Entorno (.env)

Asegúrate de que tu archivo `.env` tenga las siguientes variables configuradas:

```dotenv
# Configuración del Servidor
PORT=3003
NODE_ENV=development

# Base de Datos MongoDB
MONGO_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/?appName=app

# Ollama (Local)
OLLAMA_HOST=http://127.0.0.1:11434
OLLAMA_MODEL=Llama2:7b-chat

# OpenAI (Opcional)
OPENAI_API_KEY=sk-tu-api-key-aqui

# Google Gemini (Opcional)
GEMINI_API_KEY=tu-api-key-aqui
```

### 3. Obtener API Keys

#### OpenAI
1. Ve a [platform.openai.com](https://platform.openai.com)
2. Crea una cuenta o inicia sesión
3. Ve a "API Keys" y genera una nueva clave
4. Copia la clave y agrégala a tu `.env` como `OPENAI_API_KEY`

#### Google Gemini
1. Ve a [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Crea una nueva API key
4. Copia la clave y agrégala a tu `.env` como `GEMINI_API_KEY`

### 4. Configurar Base de Datos

El servicio requiere MongoDB para almacenar el historial de conversaciones:

1. **Opción A - MongoDB Atlas (Nube):**
   - Crea una cuenta gratuita en [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Crea un cluster
   - Obtén la connection string
   - Agrégala a `MONGO_URI` en tu `.env`

2. **Opción B - MongoDB Local:**
   ```bash
   # Instalar MongoDB localmente
   # Ubuntu/Debian
   sudo apt install mongodb
   
   # macOS
   brew install mongodb-community
   
   # Connection string
   MONGO_URI=mongodb://localhost:27017/sophia-chats
   ```

### 5. Iniciar el Servicio

```bash
# Instalar dependencias
pnpm install

# Modo desarrollo (con hot-reload)
pnpm dev

# Modo producción
pnpm build
pnpm start
```

### 6. Verificar el Servicio

Una vez iniciado el servidor, verifica que todo funcione correctamente:

```bash
# Health check
curl http://localhost:3003/api/v1/health

# Verificar conexión a MongoDB
# Deberías ver en los logs: "Connected to MongoDB"

# Probar chat básico
curl -X POST http://localhost:3003/api/v1/ai/chat \
  -H "Authorization: Bearer eyJraWQiOiI1S2VpK2p3d0JuRUxL..." \
  -H "Content-Type: application/json" \
  -d '{"message":"Hola, ¿funciona el servicio?"}'

# Listar chats
curl -H "Authorization: Bearer eyJraWQiOiI1S2VpK2p3d0JuRUxL..." \
  http://localhost:3003/api/v1/chats
```

---

## 📝 Resumen de Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/ai/chat` | Conversación con IA (guarda historial) |
| POST | `/api/v1/ai/course-assistant` | Generar estructura de curso |
| GET | `/api/v1/chats` | Listar todos los chats |
| GET | `/api/v1/chats?type=chat` | Listar solo conversaciones |
| GET | `/api/v1/chats?type=course` | Listar solo cursos generados |
| GET | `/api/v1/chats/:id` | Obtener historial de un chat |
| DELETE | `/api/v1/chats/:id` | Eliminar un chat |
| GET | `/api/v1/health` | Estado del servicio |

---

## 🔧 Solución de Problemas

### Error: "MongoDB connection error"
- Verifica que `MONGO_URI` esté correctamente configurado en `.env`
- Asegúrate de que tu IP esté en la whitelist de MongoDB Atlas
- Verifica que las credenciales sean correctas

### Error: "AI Service Error: fetch failed"
- Para Ollama: Asegúrate de que Ollama esté corriendo (`curl http://127.0.0.1:11434`)
- Para OpenAI: Verifica que `OPENAI_API_KEY` sea válida
- Para Gemini: Verifica que `GEMINI_API_KEY` sea válida

### Error: "Chat not found"
- Verifica que el `chatId` sea correcto
- El chat puede haber sido eliminado

### Error: "API key not valid"
- Para OpenAI: Obtén una nueva key en [platform.openai.com](https://platform.openai.com)
- Para Gemini: Obtén una nueva key en [Google AI Studio](https://aistudio.google.com/app/apikey)
- Reinicia el servidor después de actualizar las keys en `.env`
