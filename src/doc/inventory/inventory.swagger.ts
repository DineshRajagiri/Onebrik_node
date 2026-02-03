import { ApiOperation, ApiResponse, ApiTags, ApiBody, ApiParam, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

// Inventory API Tags
export const InventoryTags = ApiTags('Inventory Management');

// Combined Inventory Decorators - Single decorator per endpoint
export const InventoryDecorators = {
  createAttribute: applyDecorators(
    ApiOperation({
      summary: 'Create product attribute',
      description: 'Creates a new product attribute (e.g., Color, Size, Material)'
    }),
    ApiBody({
      description: 'Attribute details',
      required: true,
      schema: {
        type: 'object',
        required: ['attributename'],
        properties: {
          attributename: {
            type: 'string',
            description: 'Name of the attribute',
            example: 'Size'
          }
        }
      }
    }),
    ApiResponse({
      status: 201,
      description: 'Attribute created successfully',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Attribute created successfully' },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '507f1f77bcf86cd799439011' },
              attributename: { type: 'string', example: 'Size' }
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

  createAttributeValue: applyDecorators(
    ApiOperation({
      summary: 'Create attribute value',
      description: 'Creates a new value for an existing attribute (e.g., Red for Color attribute)'
    }),
    ApiBody({
      description: 'Attribute value details',
      required: true,
      schema: {
        type: 'object',
        required: ['attributeId', 'value'],
        properties: {
          attributeId: {
            type: 'string',
            description: 'ID of the parent attribute',
            example: '507f1f77bcf86cd799439011'
          },
          value: {
            type: 'string',
            description: 'Value for the attribute',
            example: 'Large'
          },
          displayOrder: {
            type: 'number',
            description: 'Display order for sorting',
            example: 1
          }
        }
      }
    }),
    ApiResponse({
      status: 201,
      description: 'Attribute value created successfully'
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - Invalid input data'
    })
  ),

  createInventoryCategory: applyDecorators(
    ApiOperation({
      summary: 'Create inventory category',
      description: 'Creates a new category for organizing products'
    }),
    ApiBody({
      description: 'Category details',
      required: true,
      schema: {
        type: 'object',
        required: ['name'],
        properties: {
          name: {
            type: 'string',
            description: 'Category name',
            example: 'Electronics'
          },
          description: {
            type: 'string',
            description: 'Category description',
            example: 'Electronic devices and accessories'
          },
          parentCategoryId: {
            type: 'string',
            description: 'Parent category ID for nested categories',
            example: '507f1f77bcf86cd799439012'
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the category is active',
            default: true,
            example: true
          }
        }
      }
    }),
    ApiResponse({
      status: 201,
      description: 'Category created successfully'
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - Invalid input data'
    })
  ),

  createProductVariant: applyDecorators(
    ApiOperation({
      summary: 'Create product variant',
      description: 'Creates a new variant of an existing product with specific attributes'
    }),
    ApiBody({
      description: 'Product variant details',
      required: true,
      schema: {
        type: 'object',
        required: ['productId', 'sku', 'price'],
        properties: {
          productId: {
            type: 'string',
            description: 'ID of the parent product',
            example: '507f1f77bcf86cd799439013'
          },
          sku: {
            type: 'string',
            description: 'Stock Keeping Unit',
            example: 'PROD-VAR-001'
          },
          price: {
            type: 'number',
            description: 'Variant price',
            example: 99.99
          },
          comparePrice: {
            type: 'number',
            description: 'Compare at price',
            example: 129.99
          },
          costPrice: {
            type: 'number',
            description: 'Cost price',
            example: 70.00
          },
          inventory: {
            type: 'object',
            properties: {
              quantity: { type: 'number', example: 100 },
              trackQuantity: { type: 'boolean', example: true },
              allowBackorder: { type: 'boolean', example: false }
            }
          },
          weight: {
            type: 'number',
            description: 'Variant weight in grams',
            example: 500
          }
        }
      }
    }),
    ApiResponse({
      status: 201,
      description: 'Product variant created successfully'
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - Invalid input data'
    })
  ),

  createVariantImages: applyDecorators(
    ApiOperation({
      summary: 'Upload variant images',
      description: 'Uploads multiple images for a product variant'
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description: 'Variant images upload',
      required: true,
      schema: {
        type: 'object',
        required: ['productVariantId', 'images'],
        properties: {
          productVariantId: {
            type: 'string',
            description: 'Product variant ID',
            example: '507f1f77bcf86cd799439017'
          },
          images: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary'
            },
            description: 'Image files (max 10)',
            maxItems: 10
          }
        }
      }
    }),
    ApiResponse({
      status: 201,
      description: 'Images uploaded successfully',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', example: '507f1f77bcf86cd799439018' },
                imageUrl: { type: 'string', example: 'http://localhost:3000/uploads/variant-images/1765392157803-191150104-images.jpeg' },
                productVariantId: { type: 'string', example: '507f1f77bcf86cd799439017' }
              }
            }
          }
        }
      }
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - Missing files or productVariantId'
    })
  ),

  createFullProduct: applyDecorators(
    ApiOperation({
      summary: 'Create complete product',
      description: 'Creates a complete product with all variants, attributes, and details'
    }),
    ApiBody({
      description: 'Complete product details',
      required: true,
      schema: {
        type: 'object',
        required: ['name', 'description', 'categoryId'],
        properties: {
          name: {
            type: 'string',
            description: 'Product name',
            example: 'Wireless Headphones'
          },
          description: {
            type: 'string',
            description: 'Product description',
            example: 'High-quality wireless headphones with noise cancellation'
          },
          categoryId: {
            type: 'string',
            description: 'Product category ID',
            example: '507f1f77bcf86cd799439018'
          },
          brand: {
            type: 'string',
            description: 'Product brand',
            example: 'TechBrand'
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
            description: 'Product tags',
            example: ['wireless', 'audio', 'electronics']
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the product is active',
            default: true,
            example: true
          }
        }
      }
    }),
    ApiResponse({
      status: 201,
      description: 'Product created successfully'
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - Invalid input data'
    })
  ),

  getAllProducts: applyDecorators(
    ApiOperation({
      summary: 'Get all products',
      description: 'Retrieves a paginated list of all products'
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: 'number',
      description: 'Page number (default: 1)'
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: 'number',
      description: 'Items per page (default: 10)'
    }),
    ApiQuery({
      name: 'search',
      required: false,
      type: 'string',
      description: 'Search term for product name or description'
    }),
    ApiResponse({
      status: 200,
      description: 'Products retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              products: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: '507f1f77bcf86cd799439019' },
                    name: { type: 'string', example: 'Wireless Headphones' },
                    description: { type: 'string', example: 'High-quality wireless headphones' },
                    category: { type: 'string', example: 'Electronics' },
                    variants: { type: 'array', example: [] }
                  }
                }
              },
              pagination: {
                type: 'object',
                properties: {
                  page: { type: 'number', example: 1 },
                  limit: { type: 'number', example: 10 },
                  total: { type: 'number', example: 50 },
                  totalPages: { type: 'number', example: 5 }
                }
              }
            }
          }
        }
      }
    })
  ),

  getProductById: applyDecorators(
    ApiOperation({
      summary: 'Get product by ID',
      description: 'Retrieves a specific product with all its details and variants'
    }),
    ApiParam({
      name: 'id',
      description: 'Product unique identifier',
      type: 'string'
    }),
    ApiResponse({
      status: 200,
      description: 'Product retrieved successfully'
    }),
    ApiResponse({
      status: 404,
      description: 'Product not found'
    })
  ),

  updateFullProduct: applyDecorators(
    ApiOperation({
      summary: 'Update complete product',
      description: 'Updates a complete product with all its details'
    }),
    ApiParam({
      name: 'id',
      description: 'Product unique identifier',
      type: 'string'
    }),
    ApiBody({
      description: 'Updated product details',
      required: true,
      schema: {
        type: 'object',
        required: ['name', 'description', 'categoryId'],
        properties: {
          name: {
            type: 'string',
            description: 'Product name',
            example: 'Updated Wireless Headphones'
          },
          description: {
            type: 'string',
            description: 'Product description',
            example: 'Updated high-quality wireless headphones with noise cancellation'
          },
          categoryId: {
            type: 'string',
            description: 'Product category ID',
            example: '507f1f77bcf86cd799439018'
          }
        }
      }
    }),
    ApiResponse({
      status: 200,
      description: 'Product updated successfully'
    }),
    ApiResponse({
      status: 404,
      description: 'Product not found'
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - Invalid input data'
    })
  ),

  deleteProduct: applyDecorators(
    ApiOperation({
      summary: 'Delete product',
      description: 'Permanently removes a product and all its variants'
    }),
    ApiParam({
      name: 'id',
      description: 'Product unique identifier',
      type: 'string'
    }),
    ApiResponse({
      status: 200,
      description: 'Product deleted successfully'
    }),
    ApiResponse({
      status: 404,
      description: 'Product not found'
    })
  )
};