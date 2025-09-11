# SOPHIA TutorChatService

## Descripción del Proyecto

SOPHIA TutorChatService es un backend desarrollado en Node.js y TypeScript que forma parte del sistema SOPHIA (Sistema Operativo de Pedagogía Híbrida Inteligente y Adaptativa). Este servicio proporciona la funcionalidad de chat y tutoría virtual, facilitando la comunicación inteligente entre estudiantes y el sistema de tutoría automatizada.

El backend está diseñado con una arquitectura modular y escalable, implementando mejores prácticas de desarrollo como middleware de seguridad, manejo centralizado de errores, logging estructurado y testing automatizado.

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
   # Editar el archivo .env 
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
├── controllers/           # Controladores de las rutas
├── middleware/            # Middlewares personalizados
├── routes/                # Definición de rutas
└── utils/                 # Utilidades y tipos

test/                      # Tests automatizados
```