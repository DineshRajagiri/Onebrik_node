import { ApiOperation, ApiResponse, ApiTags, ApiBody, ApiParam } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

// Permission API Tags
export const PermissionTags = ApiTags('Permission Management');

// Combined Permission Decorators - Single decorator per endpoint
export const PermissionDecorators = {
  createPermission: applyDecorators(
    ApiOperation({
      summary: 'Create new permission',
      description: 'Creates a new permission with specified access rights'
    }),
    ApiBody({
      description: 'Permission details',
      required: true,
      schema: {
        type: 'object',
        required: ['name', 'description', 'module'],
        properties: {
          name: {
            type: 'string',
            description: 'Permission name',
            example: 'create_user'
          },
          description: {
            type: 'string',
            description: 'Permission description',
            example: 'Permission to create new users'
          },
          module: {
            type: 'string',
            description: 'Module this permission belongs to',
            example: 'users'
          },
          action: {
            type: 'string',
            description: 'Action type',
            example: 'create'
          },
          resource: {
            type: 'string',
            description: 'Resource this permission applies to',
            example: 'user'
          }
        }
      }
    }),
    ApiResponse({
      status: 201,
      description: 'Permission created successfully',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Permission created successfully' },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '507f1f77bcf86cd799439011' },
              name: { type: 'string', example: 'create_user' },
              description: { type: 'string', example: 'Permission to create new users' },
              module: { type: 'string', example: 'users' }
            }
          }
        }
      }
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - Invalid input data'
    }),
    ApiResponse({
      status: 409,
      description: 'Conflict - Permission already exists'
    })
  ),

  updatePermission: applyDecorators(
    ApiOperation({
      summary: 'Update permission',
      description: 'Updates an existing permission with new details'
    }),
    ApiParam({
      name: 'id',
      description: 'Permission unique identifier',
      type: 'string'
    }),
    ApiBody({
      description: 'Updated permission details',
      required: true,
      schema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Permission name',
            example: 'update_user'
          },
          description: {
            type: 'string',
            description: 'Permission description',
            example: 'Permission to update user information'
          },
          module: {
            type: 'string',
            description: 'Module this permission belongs to',
            example: 'users'
          }
        }
      }
    }),
    ApiResponse({
      status: 200,
      description: 'Permission updated successfully'
    }),
    ApiResponse({
      status: 404,
      description: 'Permission not found'
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - Invalid input data'
    })
  ),

  createModule: applyDecorators(
    ApiOperation({
      summary: 'Create new module',
      description: 'Creates a new module for organizing permissions'
    }),
    ApiBody({
      description: 'Module details',
      required: true,
      schema: {
        type: 'object',
        required: ['name', 'description'],
        properties: {
          name: {
            type: 'string',
            description: 'Module name',
            example: 'users'
          },
          description: {
            type: 'string',
            description: 'Module description',
            example: 'User management module'
          },
          icon: {
            type: 'string',
            description: 'Module icon',
            example: 'users-icon'
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the module is active',
            default: true,
            example: true
          }
        }
      }
    }),
    ApiResponse({
      status: 201,
      description: 'Module created successfully'
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - Invalid input data'
    })
  ),

  bulkUpdatePermissionRole: applyDecorators(
    ApiOperation({
      summary: 'Bulk update permission roles',
      description: 'Updates multiple permission-role associations in a single operation'
    }),
    ApiBody({
      description: 'Bulk permission-role update details',
      required: true,
      schema: {
        type: 'object',
        required: ['roleId', 'permissions'],
        properties: {
          roleId: {
            type: 'string',
            description: 'Role ID to update permissions for',
            example: '507f1f77bcf86cd799439012'
          },
          permissions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                permissionId: { type: 'string', example: '507f1f77bcf86cd799439013' },
                granted: { type: 'boolean', example: true }
              }
            },
            description: 'Array of permission updates',
            example: [
              { permissionId: '507f1f77bcf86cd799439013', granted: true },
              { permissionId: '507f1f77bcf86cd799439014', granted: false }
            ]
          }
        }
      }
    }),
    ApiResponse({
      status: 200,
      description: 'Permission roles updated successfully',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Permission roles updated successfully' },
          data: {
            type: 'object',
            properties: {
              updated: { type: 'number', example: 5 },
              failed: { type: 'number', example: 0 }
            }
          }
        }
      }
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - Invalid input data'
    })
  ),

  getAllPermissions: applyDecorators(
    ApiOperation({
      summary: 'Get all permissions',
      description: 'Retrieves a list of all permissions in the system'
    }),
    ApiResponse({
      status: 200,
      description: 'Permissions retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', example: '507f1f77bcf86cd799439015' },
                name: { type: 'string', example: 'create_user' },
                description: { type: 'string', example: 'Permission to create new users' },
                module: { type: 'string', example: 'users' },
                createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' }
              }
            }
          }
        }
      }
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Authentication required'
    })
  ),

  getPermissionById: applyDecorators(
    ApiOperation({
      summary: 'Get permission by ID',
      description: 'Retrieves a specific permission by its unique identifier'
    }),
    ApiParam({
      name: 'id',
      description: 'Permission unique identifier',
      type: 'string'
    }),
    ApiResponse({
      status: 200,
      description: 'Permission retrieved successfully'
    }),
    ApiResponse({
      status: 404,
      description: 'Permission not found'
    })
  ),

  deletePermission: applyDecorators(
    ApiOperation({
      summary: 'Delete permission',
      description: 'Permanently removes a permission from the system'
    }),
    ApiParam({
      name: 'id',
      description: 'Permission unique identifier',
      type: 'string'
    }),
    ApiResponse({
      status: 200,
      description: 'Permission deleted successfully'
    }),
    ApiResponse({
      status: 404,
      description: 'Permission not found'
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - Permission is in use'
    })
  )
};