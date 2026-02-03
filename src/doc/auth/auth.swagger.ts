import { ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

// Auth API Tags
export const AuthTags = ApiTags('Authentication');

// Combined Auth Decorators - Single decorator per endpoint
export const AuthDecorators = {
  userRegister: applyDecorators(
    ApiOperation({
      summary: 'Register a new user',
      description: 'Creates a new user account with the provided details'
    }),
    ApiBody({
      description: 'User registration details',
      required: true,
      schema: {
        type: 'object',
        required: ['email', 'fullName', 'mobileNumber', 'passwordHash'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
            example: 'user@example.com'
          },
          fullName: {
            type: 'string',
            description: 'User full name',
            example: 'John Doe'
          },
          mobileNumber: {
            type: 'string',
            description: 'User mobile number',
            example: '1234567890'
          },
          passwordHash: {
            type: 'string',
            description: 'User password',
            example: 'strongPassword123'
          },
          referralCode: {
            type: 'string',
            description: 'Optional referral code',
            maxLength: 10,
            example: 'REF12345'
          }
        }
      }
    }),
    ApiResponse({
      status: 201,
      description: 'User registered successfully',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'User registered successfully' },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '507f1f77bcf86cd799439011' },
              email: { type: 'string', example: 'user@example.com' },
              fullName: { type: 'string', example: 'John Doe' }
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
      description: 'Conflict - User already exists'
    })
  ),

  adminRegistration: applyDecorators(
    ApiOperation({
      summary: 'Register a new admin',
      description: 'Creates a new admin account with the provided credentials'
    }),
    ApiBody({
      description: 'Admin registration details',
      required: true,
      schema: {
        type: 'object',
        required: ['fullName', 'mobileNo', 'email', 'password', 'confirmPassword'],
        properties: {
          fullName: {
            type: 'string',
            description: 'Admin full name',
            example: 'Admin User'
          },
          mobileNo: {
            type: 'string',
            description: 'Admin mobile number',
            example: '9876543210'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Admin email address',
            example: 'admin@example.com'
          },
          password: {
            type: 'string',
            description: 'Admin password',
            minLength: 6,
            example: 'adminPassword123'
          },
          confirmPassword: {
            type: 'string',
            description: 'Confirm admin password',
            example: 'adminPassword123'
          }
        }
      }
    }),
    ApiResponse({
      status: 201,
      description: 'Admin registered successfully',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Admin registered successfully' },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '507f1f77bcf86cd799439012' },
              email: { type: 'string', example: 'admin@example.com' },
              fullName: { type: 'string', example: 'Admin User' }
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

  adminLogin: applyDecorators(
    ApiOperation({
      summary: 'Admin login',
      description: 'Authenticates admin user and returns access token'
    }),
    ApiBody({
      description: 'Admin login credentials',
      required: true,
      schema: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: {
            type: 'string',
            description: 'Admin username',
            example: 'admin@example.com'
          },
          password: {
            type: 'string',
            description: 'Admin password',
            example: 'adminPassword123'
          }
        }
      }
    }),
    ApiResponse({
      status: 200,
      description: 'Login successful',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Login successful' },
          data: {
            type: 'object',
            properties: {
              accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
              refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: '507f1f77bcf86cd799439013' },
                  email: { type: 'string', example: 'admin@example.com' },
                  role: { type: 'string', example: 'admin' }
                }
              }
            }
          }
        }
      }
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Invalid credentials'
    })
  ),

  login: applyDecorators(
    ApiOperation({
      summary: 'User login',
      description: 'Authenticates user and returns access token'
    }),
    ApiBody({
      description: 'User login credentials',
      required: true,
      schema: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
            example: 'user@example.com'
          },
          password: {
            type: 'string',
            description: 'User password',
            example: 'userPassword123'
          }
        }
      }
    }),
    ApiResponse({
      status: 200,
      description: 'Login successful',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Login successful' },
          data: {
            type: 'object',
            properties: {
              accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
              refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: '507f1f77bcf86cd799439014' },
                  email: { type: 'string', example: 'user@example.com' },
                  role: { type: 'string', example: 'user' }
                }
              }
            }
          }
        }
      }
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Invalid credentials'
    })
  ),

  refreshToken: applyDecorators(
    ApiOperation({
      summary: 'Refresh access token',
      description: 'Generates a new access token using refresh token'
    }),
    ApiBody({
      description: 'Refresh token request',
      required: true,
      schema: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: {
            type: 'string',
            description: 'Valid refresh token',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
          }
        }
      }
    }),
    ApiResponse({
      status: 200,
      description: 'Token refreshed successfully',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
              refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
            }
          }
        }
      }
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Invalid refresh token'
    })
  )
};