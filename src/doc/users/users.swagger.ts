import { ApiOperation, ApiResponse, ApiTags, ApiBody, ApiParam } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

// Users API Tags
export const UsersTags = ApiTags('Users Management');

// Combined Users Decorators - Single decorator per endpoint
export const UsersDecorators = {
  createAdmin: applyDecorators(
    ApiOperation({
      summary: 'Create a new admin user',
      description: 'Creates a new admin user with the specified role and permissions'
    }),
    ApiBody({
      description: 'Admin user details',
      required: true,
      schema: {
        type: 'object',
        required: ['name', 'email', 'password', 'roleId'],
        properties: {
          name: {
            type: 'string',
            description: 'Admin full name',
            example: 'John Admin'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Admin email address',
            example: 'admin@example.com'
          },
          password: {
            type: 'string',
            minLength: 6,
            description: 'Admin password',
            example: 'securePassword123'
          },
          roleId: {
            type: 'string',
            description: 'Role ID for the admin',
            example: '507f1f77bcf86cd799439011'
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the admin is active',
            default: true,
            example: true
          },
          department: {
            type: 'string',
            description: 'Admin department',
            example: 'IT'
          },
          level: {
            type: 'number',
            description: 'Admin level',
            example: 1
          }
        }
      }
    }),
    ApiResponse({
      status: 201,
      description: 'Admin created successfully',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Admin created successfully' },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '507f1f77bcf86cd799439011' },
              email: { type: 'string', example: 'admin@example.com' },
              name: { type: 'string', example: 'John Admin' },
              role: { type: 'string', example: 'admin' }
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
      description: 'Conflict - Admin already exists'
    })
  ),

  createVendor: applyDecorators(
    ApiOperation({
      summary: 'Create a new vendor',
      description: 'Creates a new vendor account for managing products and inventory'
    }),
    ApiBody({
      description: 'Vendor details',
      required: true,
      schema: {
        type: 'object',
        required: ['businessName', 'contactPerson', 'email', 'phoneNumber'],
        properties: {
          businessName: {
            type: 'string',
            description: 'Vendor business name',
            example: 'ABC Electronics'
          },
          contactPerson: {
            type: 'string',
            description: 'Primary contact person name',
            example: 'Jane Smith'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Vendor email address',
            example: 'vendor@abcelectronics.com'
          },
          phoneNumber: {
            type: 'string',
            description: 'Vendor phone number',
            example: '+1234567890'
          },
          address: {
            type: 'object',
            description: 'Vendor address',
            properties: {
              street: { type: 'string', example: '123 Business St' },
              city: { type: 'string', example: 'Business City' },
              state: { type: 'string', example: 'BC' },
              zipCode: { type: 'string', example: '12345' },
              country: { type: 'string', example: 'Country' }
            }
          },
          taxId: {
            type: 'string',
            description: 'Vendor tax identification number',
            example: 'TAX123456789'
          }
        }
      }
    }),
    ApiResponse({
      status: 201,
      description: 'Vendor created successfully',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Vendor created successfully' },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '507f1f77bcf86cd799439012' },
              businessName: { type: 'string', example: 'ABC Electronics' },
              email: { type: 'string', example: 'vendor@abcelectronics.com' },
              contactPerson: { type: 'string', example: 'Jane Smith' }
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

  createDeliveryPartner: applyDecorators(
    ApiOperation({
      summary: 'Create a new delivery partner',
      description: 'Creates a new delivery partner account for order fulfillment'
    }),
    ApiBody({
      description: 'Delivery partner details',
      required: true,
      schema: {
        type: 'object',
        required: ['fullName', 'email', 'phoneNumber', 'vehicleType'],
        properties: {
          fullName: {
            type: 'string',
            description: 'Delivery partner full name',
            example: 'Mike Delivery'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Delivery partner email',
            example: 'mike@delivery.com'
          },
          phoneNumber: {
            type: 'string',
            description: 'Delivery partner phone number',
            example: '+1987654321'
          },
          vehicleType: {
            type: 'string',
            enum: ['bike', 'car', 'van', 'truck'],
            description: 'Type of delivery vehicle',
            example: 'bike'
          },
          licenseNumber: {
            type: 'string',
            description: 'Driving license number',
            example: 'DL123456789'
          },
          vehicleNumber: {
            type: 'string',
            description: 'Vehicle registration number',
            example: 'ABC-1234'
          },
          workingAreas: {
            type: 'array',
            items: { type: 'string' },
            description: 'Areas where delivery partner operates',
            example: ['Downtown', 'Uptown', 'Suburbs']
          }
        }
      }
    }),
    ApiResponse({
      status: 201,
      description: 'Delivery partner created successfully',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Delivery partner created successfully' },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '507f1f77bcf86cd799439013' },
              fullName: { type: 'string', example: 'Mike Delivery' },
              email: { type: 'string', example: 'mike@delivery.com' },
              phoneNumber: { type: 'string', example: '+1987654321' }
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

  findAll: applyDecorators(
    ApiOperation({
      summary: 'Get all users',
      description: 'Retrieves a list of all users in the system'
    }),
    ApiResponse({
      status: 200,
      description: 'Users retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', example: '507f1f77bcf86cd799439014' },
                email: { type: 'string', example: 'user@example.com' },
                fullName: { type: 'string', example: 'John Doe' },
                role: { type: 'string', example: 'user' },
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

  findOne: applyDecorators(
    ApiOperation({
      summary: 'Get user by ID',
      description: 'Retrieves a specific user by their unique identifier'
    }),
    ApiParam({
      name: 'id',
      description: 'User unique identifier',
      type: 'string'
    }),
    ApiResponse({
      status: 200,
      description: 'User retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '507f1f77bcf86cd799439015' },
              email: { type: 'string', example: 'user@example.com' },
              fullName: { type: 'string', example: 'John Doe' },
              role: { type: 'string', example: 'user' },
              createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' },
              updatedAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' }
            }
          }
        }
      }
    }),
    ApiResponse({
      status: 404,
      description: 'User not found'
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Authentication required'
    })
  ),

  remove: applyDecorators(
    ApiOperation({
      summary: 'Delete user',
      description: 'Permanently removes a user from the system'
    }),
    ApiParam({
      name: 'id',
      description: 'User unique identifier',
      type: 'string'
    }),
    ApiResponse({
      status: 200,
      description: 'User deleted successfully',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'User deleted' },
          data: { type: 'null', example: null }
        }
      }
    }),
    ApiResponse({
      status: 404,
      description: 'User not found'
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Authentication required'
    })
  )
};