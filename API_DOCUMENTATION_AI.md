# Documentación de la API del Servicio de IA

Esta documentación detalla cómo configurar, ejecutar y utilizar los servicios de Inteligencia Artificial integrados en SOPHIA Coordinator.

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

## 📚 Gestión de Historial de Chats

URL Base: `/api/v1/chats`

### 3. Listar Todos los Chats

Obtiene una lista de todos los chats guardados en la base de datos.

**Endpoint:** `GET /chats`

#### Respuesta Exitosa

**Código:** `200 OK`

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "chatId": "6924ee716f476c51e6fc51df",
      "createdAt": "2025-11-24T23:47:04.596Z",
      "updatedAt": "2025-11-24T23:47:23.002Z",
      "messageCount": 4,
      "lastMessage": "La capital de Francia es París."
    }
  ]
}
```

#### Ejemplo de Petición

```bash
curl http://localhost:3003/api/v1/chats
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
    "messages": [
      {
        "role": "user",
        "content": "Hola, ¿cómo estás?",
        "timestamp": "2025-11-24T23:46:57.017Z"
      },
      {
        "role": "assistant",
        "content": "Hola! Estoy bien, gracias por preguntar.",
        "context": [123, 456, ...],
        "timestamp": "2025-11-24T23:47:04.592Z"
      }
    ],
    "createdAt": "2025-11-24T23:47:04.596Z",
    "updatedAt": "2025-11-24T23:47:23.002Z"
  }
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

Genera un esquema de curso estructurado y profesional basado en una idea y pautas de estilo.

**Endpoint:** `POST /course-assistant`

#### Cuerpo de la Petición

| Campo | Tipo | Requerido | Descripción |
|-------|------|----------|-------------|
| `idea` | string | Sí | El concepto central o tema del curso. |
| `guide` | string | Sí | Pautas estructurales, audiencia objetivo o requisitos específicos. |
| `model` | string | No | El modelo de IA a utilizar (ej: `llama3.2`, `mistral`). Si no se envía, usa el configurado por defecto. |

#### Ejemplo de Petición

```json
{
  "idea": "Introducción a la Programación en Python para Ciencia de Datos",
  "guide": "La audiencia objetivo son principiantes. Incluir 4 módulos principales. Enfocarse en ejemplos prácticos."
}
```

#### Respuesta Exitosa

**Código:** `200 OK`

```json
{
  "response": "Título del Curso: Python para Ciencia de Datos\n\nMódulo 1: Fundamentos de Python\n- Lección 1.1: Instalación y Configuración\n- Lección 1.2: Variables y Tipos de Datos..."
}
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
