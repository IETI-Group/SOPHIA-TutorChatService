# MCP Client Documentation - SOPHIA TutorChatService

## Overview

This service includes an **MCP (Model Context Protocol) client** that connects to the SOPHIA Course Service MCP server. The client enables AI-driven course creation and management through a standardized protocol.

## Architecture

```
┌─────────────────────────────┐
│  SOPHIA TutorChatService    │
│  (This Service)              │
│                              │
│  ┌──────────────────────┐   │
│  │   AI Chat Service    │   │
│  │   (Ollama/OpenAI/    │   │
│  │    Gemini)           │   │
│  └──────────────────────┘   │
│                              │
│  ┌──────────────────────┐   │
│  │   MCP Client         │───┼──┐
│  │   (Course Creation)  │   │  │
│  └──────────────────────┘   │  │
└─────────────────────────────┘  │
                                  │ HTTP/Streamable HTTP
                                  │
┌─────────────────────────────────▼───┐
│  SOPHIA Course Service               │
│  (MCP Server)                        │
│                                      │
│  Tools: create_course, create_section│
│         create_lesson, etc.          │
└──────────────────────────────────────┘
```

## Components

### 1. MCP Client (`src/services/mcp/mcpClient.ts`)

Low-level client that communicates with the MCP server using Streamable HTTP transport.

**Key Methods:**
- `connect()` - Establishes connection to MCP server
- `disconnect()` - Closes the connection
- `listTools()` - Lists all available MCP tools
- `callTool(name, arguments)` - Executes a tool on the MCP server
- `createCourse()`, `createSection()`, `createLesson()`, etc. - Convenience methods

### 2. MCP Service (`src/services/mcp.service.ts`)

High-level service that orchestrates MCP operations and integrates with the application.

**Key Features:**
- Lazy initialization (connects only when needed)
- Error handling and logging
- Orchestration of multi-step operations (e.g., creating a complete course with sections)

### 3. MCP Controller (`src/controllers/mcp.controller.ts`)

REST API controller that exposes MCP functionality through HTTP endpoints.

### 4. MCP Routes (`src/routes/mcp.routes.ts`)

Express routes configuration for MCP endpoints.

## Configuration

### Environment Variables

Add to your `.env` file:

```env
# MCP Server URL
MCP_SERVER_URL=http://localhost:3000/mcp
```

**Default:** `http://localhost:3000/mcp`

### Setup Requirements

1. The SOPHIA Course Service MCP server must be running
2. The server must be accessible at the configured URL
3. Network connectivity between services

## API Endpoints

All MCP endpoints are available under `/api/v1/mcp/`:

### Health & Tools

#### `GET /api/v1/mcp/health`
Check if MCP service is available and connected.

**Response:**
```json
{
  "success": true,
  "available": true
}
```

#### `GET /api/v1/mcp/tools`
List all available MCP tools from the server.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "create_course",
      "description": "Creates a new course",
      "inputSchema": { ... }
    },
    ...
  ]
}
```

### Course Operations

#### `POST /api/v1/mcp/courses/generate`
Generate a complete course structure with AI.

**Request Body:**
```json
{
  "title": "Introduction to Python Programming",
  "description": "Learn Python from scratch",
  "level": "BEGINNER",
  "numberOfSections": 3,
  "lessonsPerSection": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Course generated successfully",
  "data": {
    "courseId": "550e8400-e29b-41d4-a716-446655440000",
    "course": { ... },
    "sections": [ ... ]
  }
}
```

#### `POST /api/v1/mcp/courses`
Create a single course.

**Request Body:**
```json
{
  "instructorId": null,
  "title": "Advanced JavaScript",
  "description": "Master modern JavaScript",
  "price": 49.99,
  "level": "ADVANCED",
  "aiGenerated": true
}
```

#### `GET /api/v1/mcp/courses`
List courses with filtering.

**Query Parameters:**
- `title` (string, optional) - Filter by title
- `level` (string, optional) - Filter by level
- `aiGenerated` (boolean, optional) - Filter AI-generated courses
- `page` (number, optional) - Page number
- `size` (number, optional) - Page size

**Example:**
```bash
GET /api/v1/mcp/courses?level=BEGINNER&aiGenerated=true&page=1&size=10
```

#### `GET /api/v1/mcp/courses/:id`
Get a specific course by ID.

**Query Parameters:**
- `includeFullDetails` (boolean, optional) - Include full details

**Example:**
```bash
GET /api/v1/mcp/courses/550e8400-e29b-41d4-a716-446655440000?includeFullDetails=true
```

### Section Operations

#### `POST /api/v1/mcp/sections`
Create a section in a course.

**Request Body:**
```json
{
  "courseId": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Python Basics",
  "description": "Introduction to Python fundamentals",
  "order": 1,
  "aiGenerated": true
}
```

### Lesson Operations

#### `POST /api/v1/mcp/lessons`
Create a lesson in a section.

**Request Body:**
```json
{
  "sectionId": "section-uuid",
  "title": "Variables and Data Types",
  "description": "Learn about Python variables",
  "order": 1,
  "durationMinutes": 30,
  "lessonType": "THEORY",
  "estimatedDifficulty": 3,
  "aiGenerated": true
}
```

**Lesson Types:**
- `THEORY` - Theoretical content
- `PRACTICE` - Practical exercises
- `MIXED` - Theory + practice
- `PROJECT` - Project-based
- `CASE_STUDY` - Case study analysis
- `DISCUSSION` - Discussion-based

### Lesson Content Operations

#### `POST /api/v1/mcp/lesson-content`
Create content for a lesson.

**Request Body:**
```json
{
  "lessonId": "lesson-uuid",
  "contentType": "TEXT",
  "metadata": {
    "text": "# Introduction to Variables\n\nVariables in Python...",
    "format": "markdown"
  },
  "difficultyLevel": "BEGINNER",
  "learningTechnique": "READING_WRITING",
  "aiGenerated": true
}
```

**Content Types:**
- `TEXT` - Text content
- `VIDEO_SCRIPT` - Video script
- `SLIDES` - Presentation slides
- `INTERACTIVE` - Interactive content
- `CODE_EXAMPLE` - Code examples
- `QUIZ` - Quiz content
- `EXERCISE` - Exercise content
- `READING` - Reading material
- `AUDIO_SCRIPT` - Audio script

**Learning Techniques:**
- `VISUAL` - Visual learning
- `AUDITORY` - Auditory learning
- `KINESTHETIC` - Hands-on learning
- `READING_WRITING` - Reading and writing
- `MULTIMODAL` - Multiple techniques

## Usage Examples

### Example 1: Generate a Complete Course

```bash
curl -X POST http://localhost:3003/api/v1/mcp/courses/generate \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Machine Learning Fundamentals",
    "description": "Learn the basics of machine learning",
    "level": "INTERMEDIATE",
    "numberOfSections": 4,
    "lessonsPerSection": 3
  }'
```

### Example 2: Create Course Manually

```bash
# Step 1: Create course
COURSE_ID=$(curl -X POST http://localhost:3003/api/v1/mcp/courses \
  -H "Content-Type: application/json" \
  -d '{
    "instructorId": null,
    "title": "Web Development Bootcamp",
    "description": "Full-stack web development course",
    "price": 99.99,
    "level": "INTERMEDIATE",
    "aiGenerated": false
  }' | jq -r '.data.data.idCourse')

# Step 2: Create section
SECTION_ID=$(curl -X POST http://localhost:3003/api/v1/mcp/sections \
  -H "Content-Type: application/json" \
  -d "{
    \"courseId\": \"$COURSE_ID\",
    \"title\": \"HTML & CSS Basics\",
    \"description\": \"Learn HTML and CSS fundamentals\",
    \"order\": 1,
    \"aiGenerated\": false
  }" | jq -r '.data.data.idSection')

# Step 3: Create lesson
LESSON_ID=$(curl -X POST http://localhost:3003/api/v1/mcp/lessons \
  -H "Content-Type: application/json" \
  -d "{
    \"sectionId\": \"$SECTION_ID\",
    \"title\": \"Introduction to HTML\",
    \"description\": \"Learn HTML tags and structure\",
    \"order\": 1,
    \"durationMinutes\": 45,
    \"lessonType\": \"THEORY\",
    \"estimatedDifficulty\": 2,
    \"aiGenerated\": false
  }" | jq -r '.data.data.idLesson')

# Step 4: Add lesson content
curl -X POST http://localhost:3003/api/v1/mcp/lesson-content \
  -H "Content-Type: application/json" \
  -d "{
    \"lessonId\": \"$LESSON_ID\",
    \"contentType\": \"TEXT\",
    \"metadata\": {
      \"text\": \"# HTML Basics\\n\\nHTML stands for HyperText Markup Language...\",
      \"format\": \"markdown\"
    },
    \"difficultyLevel\": \"BEGINNER\",
    \"learningTechnique\": \"READING_WRITING\",
    \"aiGenerated\": false
  }"
```

### Example 3: List AI-Generated Courses

```bash
curl "http://localhost:3003/api/v1/mcp/courses?aiGenerated=true&page=1&size=10"
```

## Integration with AI Chat Service

The MCP client can be integrated with the AI chat service to enable course generation through natural language:

```typescript
// Example: AI generates course structure
import { mcpService } from './services/mcp.service.js';
import { aiService } from './services/ai.service.js';

async function generateCourseWithAI(userPrompt: string) {
  // Step 1: AI generates course structure
  const aiResponse = await aiService.chat({
    message: `Generate a course structure for: ${userPrompt}`,
    model: 'gemini-2.0-flash'
  });

  // Step 2: Parse AI response and create course
  const courseData = parseAIResponse(aiResponse.response);
  
  // Step 3: Use MCP to create the course
  const result = await mcpService.generateCompleteCourse({
    title: courseData.title,
    description: courseData.description,
    level: courseData.level,
    numberOfSections: courseData.sections.length
  });

  return result;
}
```

## Error Handling

All MCP operations return structured responses:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Common Errors

1. **Connection Failed**
   - **Cause:** MCP server is not running or unreachable
   - **Solution:** Ensure the SOPHIA Course Service is running at `MCP_SERVER_URL`

2. **Tool Not Found**
   - **Cause:** Requested tool doesn't exist on the server
   - **Solution:** Use `GET /api/v1/mcp/tools` to list available tools

3. **Validation Error**
   - **Cause:** Invalid input parameters
   - **Solution:** Check the request body against the schema

4. **Server Error**
   - **Cause:** Internal error on MCP server
   - **Solution:** Check MCP server logs

## Testing

### Manual Testing with curl

```bash
# 1. Check MCP health
curl http://localhost:3003/api/v1/mcp/health

# 2. List available tools
curl http://localhost:3003/api/v1/mcp/tools

# 3. Generate a test course
curl -X POST http://localhost:3003/api/v1/mcp/courses/generate \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Course",
    "description": "A test course for validation",
    "level": "BEGINNER",
    "numberOfSections": 2
  }'
```

### Integration Testing

The MCP client can be tested using the existing Vitest framework:

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mcpService } from '../src/services/mcp.service.js';

describe('MCP Service', () => {
  beforeAll(async () => {
    // Ensure connection
    await mcpService.isAvailable();
  });

  it('should list available tools', async () => {
    const tools = await mcpService.listAvailableTools();
    expect(tools.length).toBeGreaterThan(0);
  });

  it('should create a course', async () => {
    const result = await mcpService.createCourse({
      instructorId: null,
      title: 'Test Course',
      description: 'Test description',
      price: 0,
      level: 'BEGINNER',
      aiGenerated: true
    });
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  afterAll(async () => {
    await mcpService.disconnect();
  });
});
```

## Performance Considerations

1. **Lazy Initialization:** The MCP client connects only when first used
2. **Connection Reuse:** A single connection is maintained across requests
3. **Timeout Handling:** Respects `SERVICE_TIMEOUT` configuration
4. **Error Recovery:** Automatic reconnection on connection failures

## Security Considerations

1. **No Authentication Yet:** Current implementation doesn't include authentication
   - **TODO:** Add API key or OAuth authentication
   - **TODO:** Implement request signing

2. **Network Security:**
   - Use HTTPS in production
   - Configure firewall rules appropriately
   - Consider VPN for inter-service communication

3. **Input Validation:**
   - All inputs are validated using Zod schemas
   - XSS prevention through sanitization

## Troubleshooting

### MCP server connection fails

**Symptoms:** `MCP connection failed` error

**Solutions:**
1. Verify MCP server is running: `curl http://localhost:3000/mcp`
2. Check `MCP_SERVER_URL` in `.env`
3. Check network connectivity
4. Review server logs

### Tool execution fails

**Symptoms:** Tool returns error response

**Solutions:**
1. Verify tool exists: `GET /api/v1/mcp/tools`
2. Check input parameters match schema
3. Review MCP server logs for details
4. Ensure database is accessible on MCP server

### TypeScript compilation errors

**Symptoms:** Type errors during build

**Solutions:**
1. Run `pnpm install` to ensure all dependencies are installed
2. Check that `@modelcontextprotocol/sdk` and `zod` are installed
3. Review `tsconfig.json` configuration

## Future Enhancements

1. **Authentication & Authorization**
   - API key authentication
   - Role-based access control
   - Rate limiting

2. **Advanced Features**
   - Batch operations (create multiple courses at once)
   - Course cloning/templating
   - Real-time progress updates for long operations
   - Caching of frequently accessed data

3. **AI Integration**
   - Natural language course generation
   - Automatic content creation using AI
   - Course optimization recommendations

4. **Monitoring & Analytics**
   - Request/response logging
   - Performance metrics
   - Usage analytics

## References

- [Model Context Protocol Specification](https://modelcontextprotocol.io/specification)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [SOPHIA Course Service MCP Documentation](./MCP_COURSE_SERVER_DOCUMENTATION.md)
- [API Documentation](./API_DOCUMENTATION_AI.md)

## Support

For issues or questions:
1. Check application logs in console
2. Review MCP server logs
3. Consult this documentation
4. Open an issue on the project repository
