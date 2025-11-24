# Documentación de la API del Servicio de IA

Esta documentación detalla cómo configurar, ejecutar y utilizar los servicios de Inteligencia Artificial integrados en SOPHIA Coordinator.

---

## 📡 Endpoints de la API

URL Base: `/api/v1/ai`

### 1. Chat con IA

Permite interactuar con el modelo de IA.

**Endpoint:** `POST /chat`

#### Cuerpo de la Petición (Request Body)

| Campo | Tipo | Requerido | Descripción |
|-------|------|----------|-------------|
| `message` | string | Sí | El mensaje actual que se envía a la IA. |
| `model` | string | No | El modelo de IA a utilizar (ej: `llama3.2`, `mistral`). Si no se envía, usa el configurado por defecto. |
| `context` | number[] | No | Array de números (tokens) que representa el historial de la conversación. |

#### Ejemplo de Petición

```json
{
  "message": "Hola, ¿cómo puedo estructurar un curso de Python?",
  "model": "llama3.2", // Opcional
  "context": [] // Opcional, historial de conversación
}
```

#### Respuesta

Retorna la respuesta generada por el modelo de IA.

#### ¿Qué es el `context`?
El campo `context` es un array de números que el modelo genera después de cada respuesta. Este array codifica toda la conversación previa. Para mantener la memoria del chat, debes guardar este array y enviarlo de vuelta en la siguiente petición.

#### Ejemplo de Flujo de Conversación

**Paso 1: Primera Pregunta (Sin contexto)**
```json
{
  "message": "¿Por qué el cielo es azul?"
}
```

**Respuesta del Servidor:**
```json
{
  "response": "El cielo es azul debido a la dispersión de Rayleigh...",
  "context": [123, 456, 789, ...] // <--- Guarda esto
}
```

**Paso 2: Segunda Pregunta (Con contexto)**
```json
{
  "message": "¿Y por qué se pone rojo al atardecer?",
  "context": [123, 456, 789, ...] // <--- Envía lo que recibiste antes
}
```

**Respuesta del Servidor:**
```json
{
  "response": "Al atardecer, la luz recorre más distancia...",
  "context": [123, 456, 789, 1011, 1213, ...] // <--- Nuevo contexto actualizado
}
```

#### Respuesta Exitosa

**Código:** `200 OK`

```json
{
  "response": "Texto de la respuesta...",
  "context": [1, 2, 3, ...]
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

Para que el servicio de IA funcione correctamente, es necesario tener **Ollama** instalado y ejecutándose localmente (o en un servidor accesible).

### 1. Instalar Ollama
Ollama es la herramienta que nos permite ejecutar modelos de lenguaje (LLMs) localmente.
- **Descargar:** Visita [ollama.com](https://ollama.com) y descarga la versión para tu sistema operativo.
- **Instalar:** Sigue las instrucciones del instalador.

### 2. Descargar el Modelo
El proyecto está configurado para usar un modelo específico (definido en el archivo `.env`). Debes asegurarte de tener ese modelo descargado en Ollama.

Por defecto, si tu `.env` dice `OLLAMA_MODEL=llama3.2`, ejecuta en tu terminal:
```bash
ollama pull llama3.2
```
*Nota: Verifica la variable `OLLAMA_MODEL` en tu archivo `.env` para saber qué modelo descargar.*

### 3. Configuración de Variables de Entorno (.env)
Asegúrate de que tu archivo `.env` tenga las siguientes variables configuradas correctamente:

```dotenv
# Configuración de IA
OLLAMA_HOST=http://127.0.0.1:11434  # URL donde corre Ollama (por defecto es esta)
OLLAMA_MODEL=llama3.2               # El modelo a utilizar (ej: llama3.2, llama2, mistral)
```

### 4. Verificar que Ollama está corriendo
Antes de iniciar el servidor, asegúrate de que Ollama esté activo. Puedes verificarlo entrando a `http://127.0.0.1:11434` en tu navegador (debería decir "Ollama is running").

### 5. verificar que este corriendo el servicio ejecutando
```bash
pnpm dev
```

