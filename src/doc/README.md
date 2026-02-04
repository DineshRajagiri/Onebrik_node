# API Documentation Structure

This directory contains organized Swagger/OpenAPI documentation for the OneBrik Node.js application.

## Directory Structure

```
src/doc/
├── README.md                     # This file
├── index.ts                      # Main exports and common configurations
├── decorators/
│   └── swagger.decorators.ts     # Reusable Swagger decorator functions
├── auth/
│   └── auth.swagger.ts           # Authentication endpoints documentation
├── users/
│   └── users.swagger.ts          # User management endpoints documentation
├── inventory/
│   └── inventory.swagger.ts      # Inventory management endpoints documentation
├── permission/
│   └── permission.swagger.ts     # Permission management endpoints documentation
└── customer/
    └── customer.swagger.ts       # Customer operations endpoints documentation
```

## Usage

### 1. Using Pre-defined Swagger Documentation

Each module has its own Swagger documentation file that exports:
- **Tags**: API grouping tags
- **SwaggerDocs**: Detailed endpoint documentation objects

Example usage in controllers:
```typescript
import { AuthTags, AuthSwaggerDocs } from '../doc/auth/auth.swagger';

@AuthTags
@Controller('auth')
export class AuthController {
  @Post('login')
  @AuthSwaggerDocs.login.operation
  @AuthSwaggerDocs.login.body
  @AuthSwaggerDocs.login.responses[0]
  @AuthSwaggerDocs.login.responses[1]
  async login(@Body() body: LoginDto) {
    // implementation
  }
}
```

### 2. Using Simplified Decorators

For common CRUD operations, use the simplified decorators:

```typescript
import { 
  SwaggerCreate, 
  SwaggerUpdate, 
  SwaggerGet, 
  SwaggerGetById, 
  SwaggerDelete, 
  SwaggerPaginated, 
  SwaggerFileUpload 
} from '../doc/decorators/swagger.decorators';

@Controller('example')
export class ExampleController {
  @Post()
  @SwaggerCreate('Create example', CreateExampleDto)
  async create(@Body() dto: CreateExampleDto) {
    // implementation
  }

  @Get()
  @SwaggerPaginated('Get all examples')
  async findAll(@Query() query: PaginationQuery) {
    // implementation
  }

  @Get(':id')
  @SwaggerGetById('Get example by ID')
  async findOne(@Param('id') id: string) {
    // implementation
  }

  @Put(':id')
  @SwaggerUpdate('Update example', UpdateExampleDto)
  async update(@Param('id') id: string, @Body() dto: UpdateExampleDto) {
    // implementation
  }

  @Delete(':id')
  @SwaggerDelete('Delete example')
  async remove(@Param('id') id: string) {
    // implementation
  }
}
```

## Available Simplified Decorators

### SwaggerCreate(summary, bodyType, description?)
- Adds operation, body, and standard create responses (201, 400, 401)

### SwaggerUpdate(summary, bodyType, description?)
- Adds operation, param, body, and standard update responses (200, 400, 404, 401)

### SwaggerGet(summary, description?)
- Adds operation and standard get responses (200, 401)

### SwaggerGetById(summary, description?)
- Adds operation, param, and standard get responses (200, 404, 401)

### SwaggerDelete(summary, description?)
- Adds operation, param, and standard delete responses (200, 404, 401)

### SwaggerPaginated(summary, description?)
- Adds operation, pagination query params, and standard responses (200, 401)

### SwaggerFileUpload(summary, description?)
- Adds operation, multipart/form-data consumes, and file upload responses (201, 400, 401)

## Common Response Schemas

The `index.ts` file exports common response schemas:
- `CommonSwaggerResponses`: Standard HTTP response schemas
- `CommonSwaggerSchemas`: Reusable schemas like pagination

## Best Practices

1. **Organize by Module**: Keep documentation files organized by feature/module
2. **Use Descriptive Summaries**: Write clear, concise operation summaries
3. **Include Examples**: Provide example request/response bodies where helpful
4. **Consistent Responses**: Use common response schemas for consistency
5. **Keep Controllers Clean**: Use the simplified decorators to reduce controller clutter
6. **Document Edge Cases**: Include error responses for validation failures, not found, etc.

## Adding New Module Documentation

1. Create a new folder under `src/doc/` for your module
2. Create a `{module}.swagger.ts` file with your documentation
3. Export tags and documentation objects
4. Import and use in your controller
5. Add exports to `src/doc/index.ts`

Example structure:
```typescript
// src/doc/newmodule/newmodule.swagger.ts
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

export const NewModuleSwaggerDocs = {
  // Your endpoint documentation
};

export const NewModuleTags = ApiTags('New Module');
```

## Accessing Documentation

Once implemented, the API documentation will be available at:
- **Swagger UI**: `http://localhost:3000/api-doc`
- **JSON Schema**: `http://localhost:3000/api-doc-json`

## Notes

- All endpoints are currently marked as `@Public()` - adjust authentication decorators as needed
- File upload endpoints use local storage - consider cloud storage for production
- Pagination parameters are standardized across all paginated endpoints
- Response schemas follow a consistent structure with `success`, `message`, and `data` fields