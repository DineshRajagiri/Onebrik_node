import { ApiOperation, ApiResponse, ApiTags, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';

export const CustomerSwaggerDocs = {
  // Customer Authentication
  customerAuth: {
    operation: ApiOperation({
      summary: 'Customer authentication',
      description: 'Authenticates customer using phone number and OTP'
    }),
    body: ApiBody({
      schema: {
        type: 'object',
        properties: {
          phoneNumber: {
            type: 'string',
            description: 'Customer phone number',
            example: '+1234567890'
          },
          otp: {
            type: 'string',
            description: 'One-time password',
            example: '123456'
          }
        },
        required: ['phoneNumber', 'otp']
      }
    }),
    responses: [
      ApiResponse({
        status: 200,
        description: 'Authentication successful',
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Authentication successful' },
            data: {
              type: 'object',
              properties: {
                accessToken: { type: 'string' },
                refreshToken: { type: 'string' },
                customer: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    phoneNumber: { type: 'string' },
                    name: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }),
      ApiResponse({
        status: 401,
        description: 'Invalid OTP or phone number'
      })
    ]
  },

  // Add to Cart
  addToCart: {
    operation: ApiOperation({
      summary: 'Add item to cart',
      description: 'Adds a product variant to customer cart'
    }),
    body: ApiBody({
      schema: {
        type: 'object',
        properties: {
          productVariantId: {
            type: 'string',
            description: 'Product variant ID'
          },
          quantity: {
            type: 'number',
            description: 'Quantity to add',
            minimum: 1
          }
        },
        required: ['productVariantId', 'quantity']
      }
    }),
    responses: [
      ApiResponse({
        status: 201,
        description: 'Item added to cart successfully'
      }),
      ApiResponse({
        status: 400,
        description: 'Invalid product variant or quantity'
      }),
      ApiResponse({
        status: 401,
        description: 'Authentication required'
      })
    ]
  },

  // Get Cart Items
  getCartItems: {
    operation: ApiOperation({
      summary: 'Get cart items',
      description: 'Retrieves all items in customer cart'
    }),
    responses: [
      ApiResponse({
        status: 200,
        description: 'Cart items retrieved successfully',
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      productVariant: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          name: { type: 'string' },
                          price: { type: 'number' },
                          images: { type: 'array' }
                        }
                      },
                      quantity: { type: 'number' },
                      subtotal: { type: 'number' }
                    }
                  }
                },
                total: { type: 'number' },
                itemCount: { type: 'number' }
              }
            }
          }
        }
      }),
      ApiResponse({
        status: 401,
        description: 'Authentication required'
      })
    ]
  },

  // Update Cart Item
  updateCartItem: {
    operation: ApiOperation({
      summary: 'Update cart item quantity',
      description: 'Updates the quantity of an item in the cart'
    }),
    param: ApiParam({
      name: 'itemId',
      description: 'Cart item ID',
      type: 'string'
    }),
    body: ApiBody({
      schema: {
        type: 'object',
        properties: {
          quantity: {
            type: 'number',
            description: 'New quantity',
            minimum: 1
          }
        },
        required: ['quantity']
      }
    }),
    responses: [
      ApiResponse({
        status: 200,
        description: 'Cart item updated successfully'
      }),
      ApiResponse({
        status: 404,
        description: 'Cart item not found'
      }),
      ApiResponse({
        status: 400,
        description: 'Invalid quantity'
      })
    ]
  },

  // Remove Cart Item
  removeCartItem: {
    operation: ApiOperation({
      summary: 'Remove item from cart',
      description: 'Removes an item from the customer cart'
    }),
    param: ApiParam({
      name: 'itemId',
      description: 'Cart item ID',
      type: 'string'
    }),
    responses: [
      ApiResponse({
        status: 200,
        description: 'Item removed from cart successfully'
      }),
      ApiResponse({
        status: 404,
        description: 'Cart item not found'
      })
    ]
  },

  // Create Order
  createOrder: {
    operation: ApiOperation({
      summary: 'Create new order',
      description: 'Creates a new order from cart items'
    }),
    body: ApiBody({
      schema: {
        type: 'object',
        properties: {
          deliveryAddressId: {
            type: 'string',
            description: 'Delivery address ID'
          },
          paymentMethod: {
            type: 'string',
            enum: ['COD', 'ONLINE'],
            description: 'Payment method'
          },
          notes: {
            type: 'string',
            description: 'Order notes (optional)'
          }
        },
        required: ['deliveryAddressId', 'paymentMethod']
      }
    }),
    responses: [
      ApiResponse({
        status: 201,
        description: 'Order created successfully',
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Order created successfully' },
            data: {
              type: 'object',
              properties: {
                orderId: { type: 'string' },
                orderNumber: { type: 'string' },
                total: { type: 'number' },
                status: { type: 'string' },
                estimatedDelivery: { type: 'string', format: 'date-time' }
              }
            }
          }
        }
      }),
      ApiResponse({
        status: 400,
        description: 'Invalid order data or empty cart'
      })
    ]
  },

  // Get Orders
  getOrders: {
    operation: ApiOperation({
      summary: 'Get customer orders',
      description: 'Retrieves customer order history with pagination'
    }),
    query: [
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
        name: 'status',
        required: false,
        type: 'string',
        description: 'Filter by order status'
      })
    ],
    responses: [
      ApiResponse({
        status: 200,
        description: 'Orders retrieved successfully'
      }),
      ApiResponse({
        status: 401,
        description: 'Authentication required'
      })
    ]
  },

  // Add Address
  addAddress: {
    operation: ApiOperation({
      summary: 'Add delivery address',
      description: 'Adds a new delivery address for the customer'
    }),
    body: ApiBody({
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Address name/label' },
          fullName: { type: 'string', description: 'Recipient full name' },
          phoneNumber: { type: 'string', description: 'Contact phone number' },
          addressLine1: { type: 'string', description: 'Address line 1' },
          addressLine2: { type: 'string', description: 'Address line 2 (optional)' },
          city: { type: 'string', description: 'City' },
          state: { type: 'string', description: 'State' },
          pincode: { type: 'string', description: 'PIN code' },
          landmark: { type: 'string', description: 'Landmark (optional)' },
          isDefault: { type: 'boolean', description: 'Set as default address' }
        },
        required: ['name', 'fullName', 'phoneNumber', 'addressLine1', 'city', 'state', 'pincode']
      }
    }),
    responses: [
      ApiResponse({
        status: 201,
        description: 'Address added successfully'
      }),
      ApiResponse({
        status: 400,
        description: 'Invalid address data'
      })
    ]
  },

  // Get Addresses
  getAddresses: {
    operation: ApiOperation({
      summary: 'Get customer addresses',
      description: 'Retrieves all delivery addresses for the customer'
    }),
    responses: [
      ApiResponse({
        status: 200,
        description: 'Addresses retrieved successfully'
      }),
      ApiResponse({
        status: 401,
        description: 'Authentication required'
      })
    ]
  }
};

export const CustomerTags = ApiTags('Customer Operations');