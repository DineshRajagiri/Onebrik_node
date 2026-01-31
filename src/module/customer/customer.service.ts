import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Device, DeviceDetails } from 'src/schema/device.schema';
import { Cart, CartDetails } from 'src/schema/cart.schema';
import { CartItem, CartItemDetails } from 'src/schema/cartItem.schema';
import { Customer, CustomerDetails } from 'src/schema/customer.schema';
import { CustomerAddress, CustomerAddressDetails } from 'src/schema/customerAddress.schema';
import { Payment, PaymentDetails } from 'src/schema/payment.schema';
import { Order, OrderDetails } from 'src/schema/order.schema';
import { OrderItem, OrderItemDetails } from 'src/schema/orderItem.schema';
import { Product, ProductDocument } from 'src/schema/products.schema';
import { productVariants, productVariantsDocument } from 'src/schema/productVariants.schema';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { CreateDeviceDto } from './dto/create-device.dto';
import { CreateCartItemDto, UpdateCartItemDto } from './dto/cart-item.dto';
import { CustomerRegisterDto, CustomerLoginDto } from './dto/customer-auth.dto';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { CreatePaymentDto } from './dto/payment.dto';
import { CreateOrderDto } from './dto/order.dto';
import { PaymentStatus } from 'src/utils/constants';
import { GetItemsDto } from './dto/get-items.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel(Device.name) private readonly deviceModel: Model<DeviceDetails>,
    @InjectModel(Cart.name) private readonly cartModel: Model<CartDetails>,
    @InjectModel(CartItem.name) private readonly cartItemModel: Model<CartItemDetails>,
    @InjectModel(Customer.name) private readonly customerModel: Model<CustomerDetails>,
    @InjectModel(CustomerAddress.name) private readonly addressModel: Model<CustomerAddressDetails>,
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDetails>,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDetails>,
    @InjectModel(OrderItem.name) private readonly orderItemModel: Model<OrderItemDetails>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(productVariants.name) private readonly variantModel: Model<productVariantsDocument>,
  ) {}

  // ==============================
  // DEVICE OPERATIONS
  // ==============================
  async createDevice(data: CreateDeviceDto) {
    try {
      // Check if device already exists
      const existingDevice = await this.deviceModel.findOne({
        deviceToken: data.deviceToken,
        isDeleted: false,
      });

      if (existingDevice) {
        return {
          success: true,
          message: 'Device already exists',
          statusCode: 200,
          data: existingDevice,
        };
      }

      const device = await this.deviceModel.create(data);

      return {
        success: true,
        message: 'Device created successfully',
        statusCode: 201,
        data: device,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to create device',
          statusCode: 400,
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ==============================
  // CART OPERATIONS
  // ==============================
  async activateCart(deviceId?: string, customerId?: string) {
    try {
      if (!deviceId && !customerId) {
        throw new HttpException(
          {
            success: false,
            message: 'Either deviceId or customerId is required',
            statusCode: 400,
            data: null,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check if active cart exists
      const existingCart = await this.cartModel.findOne({
        $or: [{ deviceId }, { customerId }],
        isActive: true,
        isDeleted: false,
      });

      if (existingCart) {
        // Update cart totals
        await this.updateCartTotals(existingCart._id);
        const updatedCart = await this.cartModel
          .findById(existingCart._id)
          .populate('deviceId')
          .populate('customerId');

        return {
          success: true,
          message: 'Cart already active',
          statusCode: 200,
          data: updatedCart,
        };
      }

      // Create new cart
      const cartData: any = {
        isActive: true,
        status: 'active',
        totalAmount: 0,
        totalItems: 0,
      };

      if (customerId) {
        cartData.customerId = customerId;
      } else if (deviceId) {
        cartData.deviceId = deviceId;
      }

      const cart = await this.cartModel.create(cartData);

      // If customer logged in, update device cart to customer cart
      if (customerId && deviceId) {
        await this.cartModel.updateMany(
          { deviceId, customerId: { $exists: false }, isActive: true },
          { $set: { customerId, deviceId: null } },
        );
      }

      const populatedCart = await this.cartModel
        .findById(cart._id)
        .populate('deviceId')
        .populate('customerId');

      return {
        success: true,
        message: 'Cart activated successfully',
        statusCode: 201,
        data: populatedCart,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to activate cart',
          statusCode: 400,
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getCart(deviceId?: string, customerId?: string) {
    try {
      const cart = await this.cartModel
        .findOne({
          $or: [{ deviceId }, { customerId }],
          isActive: true,
          isDeleted: false,
        })
        .populate('deviceId')
        .populate('customerId');

      if (!cart) {
        return {
          success: true,
          message: 'No active cart found',
          statusCode: 200,
          data: null,
        };
      }

      // Get cart items
      const cartItems = await this.cartItemModel
        .find({ cartId: cart._id, isDeleted: false })
        .populate('productId')
        .populate('variantId');

      // Update cart totals
      await this.updateCartTotals(cart._id);

      return {
        success: true,
        message: 'Cart fetched successfully',
        statusCode: 200,
        data: {
          cart,
          items: cartItems,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch cart',
          statusCode: 400,
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateCartTotals(cartId: string) {
    const items = await this.cartItemModel.find({
      cartId,
      isDeleted: false,
    });

    const totalAmount = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    await this.cartModel.findByIdAndUpdate(cartId, {
      totalAmount,
      totalItems,
    });
  }

  // ==============================
  // CART ITEM OPERATIONS
  // ==============================
  async addCartItem(cartId: string, data: CreateCartItemDto) {
    try {
      const cart = await this.cartModel.findById(cartId);
      if (!cart || !cart.isActive) {
        throw new HttpException(
          {
            success: false,
            message: 'Cart not found or inactive',
            statusCode: 404,
            data: null,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // Verify product exists
      const product = await this.productModel.findById(data.productId);
      if (!product) {
        throw new HttpException(
          {
            success: false,
            message: 'Product not found',
            statusCode: 404,
            data: null,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // If variant provided, verify it exists
      if (data.variantId) {
        const variant = await this.variantModel.findById(data.variantId);
        if (!variant || variant.productId !== data.productId) {
          throw new HttpException(
            {
              success: false,
              message: 'Invalid variant',
              statusCode: 400,
              data: null,
            },
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // Check if item already exists in cart
      const existingItem = await this.cartItemModel.findOne({
        cartId,
        productId: data.productId,
        variantId: data.variantId || null,
        isDeleted: false,
      });

      if (existingItem) {
        // Update quantity
        existingItem.quantity += data.quantity;
        existingItem.totalPrice = existingItem.price * existingItem.quantity;
        await existingItem.save();
      } else {
        // Create new cart item
        await this.cartItemModel.create({
          cartId,
          ...data,
          totalPrice: data.price * data.quantity,
        });
      }

      // Update cart totals
      await this.updateCartTotals(cartId);

      const cartItems = await this.cartItemModel
        .find({ cartId, isDeleted: false })
        .populate('productId')
        .populate('variantId');

      return {
        success: true,
        message: 'Item added to cart successfully',
        statusCode: 201,
        data: cartItems,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to add item to cart',
          statusCode: 400,
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateCartItem(itemId: string, data: UpdateCartItemDto) {
    try {
      const item = await this.cartItemModel.findById(itemId);
      if (!item || item.isDeleted) {
        throw new HttpException(
          {
            success: false,
            message: 'Cart item not found',
            statusCode: 404,
            data: null,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (data.quantity !== undefined) {
        item.quantity = data.quantity;
      }
      if (data.price !== undefined) {
        item.price = data.price;
      }

      item.totalPrice = item.price * item.quantity;
      await item.save();

      // Update cart totals
      await this.updateCartTotals(item.cartId);

      return {
        success: true,
        message: 'Cart item updated successfully',
        statusCode: 200,
        data: item,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to update cart item',
          statusCode: 400,
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteCartItem(itemId: string) {
    try {
      const item = await this.cartItemModel.findById(itemId);
      if (!item) {
        throw new HttpException(
          {
            success: false,
            message: 'Cart item not found',
            statusCode: 404,
            data: null,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      await this.cartItemModel.findByIdAndUpdate(itemId, {
        isDeleted: true,
      });

      // Update cart totals
      await this.updateCartTotals(item.cartId);

      return {
        success: true,
        message: 'Cart item deleted successfully',
        statusCode: 200,
        data: null,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to delete cart item',
          statusCode: 400,
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ==============================
  // CUSTOMER AUTH OPERATIONS
  // ==============================
  async registerCustomer(data: CustomerRegisterDto) {
    try {
      // Check if customer already exists
      const existingCustomer = await this.customerModel.findOne({
        $or: [{ email: data.email.toLowerCase() }, { mobileNumber: data.mobileNumber }],
        isDeleted: false,
      });

      if (existingCustomer) {
        throw new HttpException(
          {
            success: false,
            message: 'Customer already exists with this email or mobile number',
            statusCode: 409,
            data: null,
          },
          HttpStatus.CONFLICT,
        );
      }

      // Hash password
      const passwordHash = await bcrypt.hash(data.password, 10);

      // Create customer
      const customer = await this.customerModel.create({
        name: data.name,
        email: data.email.toLowerCase(),
        mobileNumber: data.mobileNumber,
        passwordHash,
        deviceId: data.deviceId,
      });

      // If deviceId provided, update cart
      if (data.deviceId) {
        await this.cartModel.updateMany(
          { deviceId: data.deviceId, isActive: true },
          { $set: { customerId: customer._id } },
        );
      }

      // Generate token
      const token = this.generateToken(customer._id, customer.email);

      return {
        success: true,
        message: 'Customer registered successfully',
        statusCode: 201,
        data: {
          customer: {
            _id: customer._id,
            customerId: customer.customerId,
            name: customer.name,
            email: customer.email,
            mobileNumber: customer.mobileNumber,
          },
          token,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to register customer',
          statusCode: 400,
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async loginCustomer(data: CustomerLoginDto) {
    try {
      const customer = await this.customerModel.findOne({
        email: data.email.toLowerCase(),
        isDeleted: false,
      });

      if (!customer) {
        throw new HttpException(
          {
            success: false,
            message: 'Invalid email or password',
            statusCode: 401,
            data: null,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const passwordMatch = await bcrypt.compare(data.password, customer.passwordHash);
      if (!passwordMatch) {
        throw new HttpException(
          {
            success: false,
            message: 'Invalid email or password',
            statusCode: 401,
            data: null,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Update deviceId if provided
      if (data.deviceId) {
        customer.deviceId = data.deviceId;
        await customer.save();

        // Merge device cart to customer cart
        await this.cartModel.updateMany(
          { deviceId: data.deviceId, isActive: true },
          { $set: { customerId: customer._id, deviceId: null } },
        );
      }

      // Generate token
      const token = this.generateToken(customer._id, customer.email);

      return {
        success: true,
        message: 'Login successful',
        statusCode: 200,
        data: {
          customer: {
            _id: customer._id,
            customerId: customer.customerId,
            name: customer.name,
            email: customer.email,
            mobileNumber: customer.mobileNumber,
          },
          token,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to login',
          statusCode: 400,
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  generateToken(customerId: string, email: string): string {
    return jwt.sign(
      { sub: customerId, email, type: 'customer' },
      process.env.JWT_ACCESS_SECRET || 'your-secret-key',
      { expiresIn: '30d' },
    );
  }

  // ==============================
  // ADDRESS OPERATIONS
  // ==============================
  async createAddress(customerId: string, data: CreateAddressDto) {
    try {
      // If this is set as default, unset other defaults
      if (data.isDefault) {
        await this.addressModel.updateMany(
          { customerId, isDefault: true },
          { $set: { isDefault: false } },
        );
      }

      const address = await this.addressModel.create({
        customerId,
        ...data,
      });

      return {
        success: true,
        message: 'Address created successfully',
        statusCode: 201,
        data: address,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to create address',
          statusCode: 400,
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getAddresses(customerId: string) {
    try {
      const addresses = await this.addressModel.find({
        customerId,
        isDeleted: false,
      });

      return {
        success: true,
        message: 'Addresses fetched successfully',
        statusCode: 200,
        data: addresses,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch addresses',
          statusCode: 400,
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateAddress(addressId: string, customerId: string, data: UpdateAddressDto) {
    try {
      const address = await this.addressModel.findOne({
        _id: addressId,
        customerId,
        isDeleted: false,
      });

      if (!address) {
        throw new HttpException(
          {
            success: false,
            message: 'Address not found',
            statusCode: 404,
            data: null,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // If setting as default, unset other defaults
      if (data.isDefault) {
        await this.addressModel.updateMany(
          { customerId, _id: { $ne: addressId }, isDefault: true },
          { $set: { isDefault: false } },
        );
      }

      Object.assign(address, data);
      await address.save();

      return {
        success: true,
        message: 'Address updated successfully',
        statusCode: 200,
        data: address,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to update address',
          statusCode: 400,
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteAddress(addressId: string, customerId: string) {
    try {
      const address = await this.addressModel.findOne({
        _id: addressId,
        customerId,
        isDeleted: false,
      });

      if (!address) {
        throw new HttpException(
          {
            success: false,
            message: 'Address not found',
            statusCode: 404,
            data: null,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      await this.addressModel.findByIdAndUpdate(addressId, {
        isDeleted: true,
      });

      return {
        success: true,
        message: 'Address deleted successfully',
        statusCode: 200,
        data: null,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to delete address',
          statusCode: 400,
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ==============================
  // ORDER OPERATIONS
  // ==============================
  async createOrder(customerId: string, data: CreateOrderDto) {
    try {
      // Get active cart
      const cart = await this.cartModel.findOne({
        customerId,
        isActive: true,
        isDeleted: false,
      });

      if (!cart) {
        throw new HttpException(
          {
            success: false,
            message: 'No active cart found',
            statusCode: 404,
            data: null,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // Get cart items
      const cartItems = await this.cartItemModel
        .find({ cartId: cart._id, isDeleted: false })
        .populate('productId')
        .populate('variantId');

      if (cartItems.length === 0) {
        throw new HttpException(
          {
            success: false,
            message: 'Cart is empty',
            statusCode: 400,
            data: null,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Verify address
      const address = await this.addressModel.findOne({
        _id: data.addressId,
        customerId,
        isDeleted: false,
      });

      if (!address) {
        throw new HttpException(
          {
            success: false,
            message: 'Address not found',
            statusCode: 404,
            data: null,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // Calculate totals
      const totalAmount = cart.totalAmount;
      const discountAmount = data.discountAmount || 0;
      const shippingCharges = data.shippingCharges || 0;
      const finalAmount = totalAmount - discountAmount + shippingCharges;

      // Create order
      const order = await this.orderModel.create({
        customerId,
        addressId: data.addressId,
        totalAmount,
        discountAmount,
        shippingCharges,
        finalAmount,
        notes: data.notes,
        orderStatus: 'pending',
      });

      // Create order items
      const orderItems = [];
      for (const item of cartItems) {
        const product = item.productId as any;
        const variant = item.variantId as any;

        const orderItem = await this.orderItemModel.create({
          orderId: order._id,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
          totalPrice: item.totalPrice,
          productName: product?.productName || '',
          variantName: variant?.variantName || '',
        });

        orderItems.push(orderItem);
      }

      // Deactivate cart
      await this.cartModel.findByIdAndUpdate(cart._id, {
        isActive: false,
        status: 'converted',
      });

      const populatedOrder = await this.orderModel
        .findById(order._id)
        .populate('customerId')
        .populate('addressId');

      return {
        success: true,
        message: 'Order created successfully',
        statusCode: 201,
        data: {
          order: populatedOrder,
          items: orderItems,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to create order',
          statusCode: 400,
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getOrderHistory(customerId: string, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const orders = await this.orderModel
        .find({ customerId, isDeleted: false })
        .populate('addressId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await this.orderModel.countDocuments({
        customerId,
        isDeleted: false,
      });

      // Get order items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await this.orderItemModel
            .find({ orderId: order._id, isDeleted: false })
            .populate('productId')
            .populate('variantId');

          return {
            order,
            items,
          };
        }),
      );

      return {
        success: true,
        message: 'Order history fetched successfully',
        statusCode: 200,
        data: {
          orders: ordersWithItems,
          total,
          page,
          limit,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch order history',
          statusCode: 400,
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getOrderById(orderId: string, customerId: string) {
    try {
      const order = await this.orderModel
        .findOne({
          _id: orderId,
          customerId,
          isDeleted: false,
        })
        .populate('addressId')
        .populate('customerId');

      if (!order) {
        throw new HttpException(
          {
            success: false,
            message: 'Order not found',
            statusCode: 404,
            data: null,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const items = await this.orderItemModel
        .find({ orderId: order._id, isDeleted: false })
        .populate('productId')
        .populate('variantId');

      return {
        success: true,
        message: 'Order fetched successfully',
        statusCode: 200,
        data: {
          order,
          items,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch order',
          statusCode: 400,
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ==============================
  // PAYMENT OPERATIONS
  // ==============================
  async createPayment(customerId: string, data: CreatePaymentDto) {
    try {
      // Verify order exists and belongs to customer
      const order = await this.orderModel.findOne({
        _id: data.orderId,
        customerId,
        isDeleted: false,
      });

      if (!order) {
        throw new HttpException(
          {
            success: false,
            message: 'Order not found',
            statusCode: 404,
            data: null,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // Verify amount matches
      if (data.amount !== order.finalAmount) {
        throw new HttpException(
          {
            success: false,
            message: 'Payment amount does not match order amount',
            statusCode: 400,
            data: null,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Create payment
      const payment = await this.paymentModel.create({
        orderId: data.orderId,
        customerId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        paymentStatus: PaymentStatus.SUCCESS, // Assuming payment is successful
        transactionId: data.transactionId,
        paymentGateway: data.paymentGateway,
        paymentDate: new Date(),
        failureReason: data.failureReason,
      });

      // Update order status
      await this.orderModel.findByIdAndUpdate(data.orderId, {
        orderStatus: 'confirmed',
      });

      return {
        success: true,
        message: 'Payment processed successfully',
        statusCode: 201,
        data: payment,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to process payment',
          statusCode: 400,
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ==============================
  // PRODUCT/ITEMS OPERATIONS
  // ==============================
  // async getItems(query: GetItemsDto) {
  //   try {
  //     const {
  //       page = 1,
  //       limit = 10,
  //       search = '',
  //       mainCategoryId,
  //       subCategoryId,
  //       subChildCategoryId,
  //       minPrice,
  //       maxPrice,
  //       sortBy = 'createdAt',
  //       sortOrder = 'desc',
  //       inStock,
  //     } = query;

  //     const skip = (page - 1) * limit;
  //     const filter: any = {
  //       isDeleted: false,
  //       isActive: true,
  //     };

  //     // Search filter
  //     if (search.trim()) {
  //       filter.productName = { $regex: search.trim(), $options: 'i' };
  //     }

  //     // Category filters
  //     if (mainCategoryId) filter.mainCategoryId = mainCategoryId;
  //     if (subCategoryId) filter.subCategoryId = subCategoryId;
  //     if (subChildCategoryId) filter.subChildCategoryId = subChildCategoryId;

  //     // Price filter (on product base price)
  //     if (minPrice !== undefined || maxPrice !== undefined) {
  //       filter.price = {};
  //       if (minPrice !== undefined) {
  //         filter.price.$gte = minPrice.toString();
  //       }
  //       if (maxPrice !== undefined) {
  //         filter.price.$lte = maxPrice.toString();
  //       }
  //     }

  //     // Sort options
  //     const sortOptions: any = {};
  //     if (sortBy === 'price') {
  //       sortOptions.price = sortOrder === 'asc' ? 1 : -1;
  //     } else if (sortBy === 'name') {
  //       sortOptions.productName = sortOrder === 'asc' ? 1 : -1;
  //     } else {
  //       sortOptions.createdAt = sortOrder === 'asc' ? 1 : -1;
  //     }

  //     // Get products
  //     const products = await this.productModel
  //       .find(filter)
  //       .populate('mainCategoryId', 'categoryName level')
  //       .populate('subCategoryId', 'categoryName level')
  //       .populate('subChildCategoryId', 'categoryName level')
  //       .skip(skip)
  //       .limit(limit)
  //       .sort(sortOptions)
  //       .lean();

  //     // Get variants for each product
  //     const productsWithVariants = await Promise.all(
  //       products.map(async (product) => {
  //         const variantFilter: any = {
  //           productId: product._id,
  //           isDeleted: false,
  //           isActive: true,
  //         };

  //         // Stock filter
  //         if (inStock !== undefined) {
  //           if (inStock) {
  //             variantFilter.stock = { $gt: '0' };
  //           } else {
  //             variantFilter.$or = [
  //               { stock: { $lte: '0' } },
  //               { stock: { $exists: false } },
  //             ];
  //           }
  //         }

  //         const variants = await this.variantModel.find(variantFilter).lean();

  //         // Apply price filter on variants if no variants match product price filter
  //         let filteredVariants = variants;
  //         if (minPrice !== undefined || maxPrice !== undefined) {
  //           filteredVariants = variants.filter((variant) => {
  //             const variantPrice = parseFloat(variant.price || '0');
  //             if (minPrice !== undefined && variantPrice < minPrice) return false;
  //             if (maxPrice !== undefined && variantPrice > maxPrice) return false;
  //             return true;
  //           });
  //         }

  //         // Get minimum and maximum prices from variants
  //         const variantPrices = filteredVariants.map((v) => parseFloat(v.price || '0'));
  //         const minVariantPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : parseFloat(product.price || '0');
  //         const maxVariantPrice = variantPrices.length > 0 ? Math.max(...variantPrices) : parseFloat(product.price || '0');

  //         return {
  //           ...product,
  //           mainCategoryName: (product.mainCategoryId as any)?.categoryName || null,
  //           subCategoryName: (product.subCategoryId as any)?.categoryName || null,
  //           subChildCategoryName: (product.subChildCategoryId as any)?.categoryName || null,
  //           variants: filteredVariants,
  //           minPrice: minVariantPrice,
  //           maxPrice: maxVariantPrice,
  //           hasVariants: filteredVariants.length > 0,
  //           totalStock: filteredVariants.reduce((sum, v) => sum + parseFloat(v.stock || '0'), 0),
  //         };
  //       }),
  //     );

  //     // Filter out products that don't have any variants matching stock filter
  //     const finalProducts = inStock !== undefined
  //       ? productsWithVariants.filter((p) => p.totalStock > 0)
  //       : productsWithVariants;

  //     // Get total count
  //     const total = await this.productModel.countDocuments(filter);

  //     return {
  //       success: true,
  //       message: 'Items fetched successfully',
  //       statusCode: 200,
  //       data: {
  //         items: finalProducts,
  //         pagination: {
  //           page: Number(page),
  //           limit: Number(limit),
  //           total,
  //           totalPages: Math.ceil(total / limit),
  //         },
  //         filters: {
  //           search,
  //           mainCategoryId,
  //           subCategoryId,
  //           subChildCategoryId,
  //           minPrice,
  //           maxPrice,
  //           sortBy,
  //           sortOrder,
  //           inStock,
  //         },
  //       },
  //     };
  //   } catch (error) {
  //     throw new HttpException(
  //       {
  //         success: false,
  //         message: error.message || 'Failed to fetch items',
  //         statusCode: 400,
  //         data: null,
  //       },
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  // }

  async getItems(query: GetItemsDto) {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      mainCategoryId,
      subCategoryId,
      subChildCategoryId,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      inStock,
    } = query;

    const skip = (page - 1) * limit;

    /* -------------------- PRODUCT FILTER -------------------- */
    const productFilter: any = {
      isDeleted: false,
      isActive: true,
    };

    if (search.trim()) {
      productFilter.productName = { $regex: search.trim(), $options: 'i' };
    }

    if (mainCategoryId) productFilter.mainCategoryId = mainCategoryId;
    if (subCategoryId) productFilter.subCategoryId = subCategoryId;
    if (subChildCategoryId) productFilter.subChildCategoryId = subChildCategoryId;

    /* -------------------- SORT -------------------- */
    const sortOptions: any = {};
    if (sortBy === 'name') {
      sortOptions.productName = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortOptions.createdAt = sortOrder === 'asc' ? 1 : -1;
    }

    /* -------------------- FETCH PRODUCTS -------------------- */
    const products = await this.productModel
      .find(productFilter)
      .populate('mainCategoryId', 'categoryName')
      .populate('subCategoryId', 'categoryName')
      .populate('subChildCategoryId', 'categoryName')
      .skip(skip)
      .limit(limit)
      .sort(sortOptions)
      .lean();

    if (!products.length) {
      return {
        success: true,
        message: 'Items fetched successfully',
        statusCode: 200,
        data: {
          items: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        },
      };
    }

    const productIds = products.map(p => p._id);

    /* -------------------- FETCH VARIANTS (ONCE) -------------------- */
    const variantFilter: any = {
      productId: { $in: productIds },
      isDeleted: false,
      isActive: true,
    };

    if (inStock !== undefined) {
      variantFilter.stock = inStock ? { $gt: 0 } : { $lte: 0 };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      variantFilter.salePrice = {};
      if (minPrice !== undefined) variantFilter.salePrice.$gte = minPrice;
      if (maxPrice !== undefined) variantFilter.salePrice.$lte = maxPrice;
    }

    const variants = await this.variantModel.find(variantFilter).lean();

    /* -------------------- GROUP VARIANTS -------------------- */
    const variantMap = new Map<string, any[]>();
    for (const v of variants) {
      const key = String(v.productId);
      if (!variantMap.has(key)) variantMap.set(key, []);
      variantMap.get(key)!.push(v);
    }

    /* -------------------- FINAL RESPONSE SHAPE -------------------- */
    const items = products.map(product => {
      const productVariants = variantMap.get(String(product._id)) || [];

      const prices = productVariants.map(v => v.offerPrice ?? v.salePrice);
      const stocks = productVariants.map(v => Number(v.stock || 0));

      return {
        id: product._id,
        name: product.productName,
        brand: product.brand,
        description: product.description,
        about: product.about,
        rating: product.rating,
        discount: product.discount,
        offer: product.offer,

        image: null, // can be filled from default variant image later
        colors: [], // derive later if needed

        quantity: stocks.reduce((a, b) => a + b, 0),
        isStock: stocks.some(s => s > 0),

        minPrice: prices.length ? Math.min(...prices) : null,
        maxPrice: prices.length ? Math.max(...prices) : null,

        created: product.createdAt,

        categories: {
          main: (product.mainCategoryId as any)?.categoryName || null,
          sub: (product.subCategoryId as any)?.categoryName || null,
          child: (product.subChildCategoryId as any)?.categoryName || null,
        },

        variants: productVariants,
      };
    });

    /* -------------------- TOTAL COUNT -------------------- */
    const total = await this.productModel.countDocuments(productFilter);

    return {
      success: true,
      message: 'Items fetched successfully',
      statusCode: 200,
      data: {
        items,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    throw new HttpException(
      {
        success: false,
        message: error.message || 'Failed to fetch items',
        statusCode: 400,
        data: null,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

}

