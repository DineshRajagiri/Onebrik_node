import { HttpException, HttpStatus, Injectable, Inject, NotFoundException } from '@nestjs/common';
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
import { CreateRazorpayOrderDto, VerifyRazorpayPaymentDto } from './dto/razorpay.dto';
import { PaymentStatus } from 'src/utils/constants';
import { GetItemsDto } from './dto/get-items.dto';
import { Services } from 'src/utils/constants';
import { PaymentGatewayService } from 'src/module/payment-gateway/payment-gateway.service';
import { GATEWAY_RAZORPAY } from 'src/module/payment-gateway/payment-gateway.interface';
import { Carousel, CarouselDocument } from 'src/schema/carousel.schema';
import { VariantImages, VariantImagesDocument } from 'src/schema/variantImages.schema';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel(Device.name) private readonly deviceModel: Model<DeviceDetails>,
    @InjectModel(Cart.name) private readonly cartModel: Model<CartDetails>,
    @InjectModel(CartItem.name) private readonly cartItemModel: Model<CartItemDetails>,
    @InjectModel(VariantImages.name) private readonly variantImageModel: Model<VariantImagesDocument>,
    @InjectModel(Customer.name) private readonly customerModel: Model<CustomerDetails>,
    @InjectModel(CustomerAddress.name) private readonly addressModel: Model<CustomerAddressDetails>,
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDetails>,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDetails>,
    @InjectModel(OrderItem.name) private readonly orderItemModel: Model<OrderItemDetails>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(productVariants.name) private readonly variantModel: Model<productVariantsDocument>,
    @InjectModel(Carousel.name) private readonly carouselModel: Model<CarouselDocument>,
    @Inject(Services.PAYMENT_GATEWAY) private readonly paymentGatewayService: PaymentGatewayService,
  ) { }

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
  // Active = current cart in use. Keyed by deviceId (guest, no JWT) or customerId (after login).
  // ==============================

  /** Links guest cart(s) for deviceId to the logged-in customer. Call when customer hits address/order with deviceId. */
  private async linkDeviceCartToCustomer(deviceId: string, customerId: string): Promise<void> {
    if (!deviceId || !customerId) return;

    // 🔹 1. Get guest cart
    const guestCart = await this.cartModel.findOne({
      deviceId,
      isActive: true,
      isDeleted: false,
    });

    if (!guestCart) return;

    // 🔹 2. Get user cart
    const userCart = await this.cartModel.findOne({
      customerId,
      isActive: true,
      isDeleted: false,
    });

    // ✅ CASE 1: User already has cart → MERGE
    if (userCart) {
      const guestItems = await this.cartItemModel.find({
        cartId: guestCart._id,
        isDeleted: false,
      });

      for (const item of guestItems) {
        const existingItem = await this.cartItemModel.findOne({
          cartId: userCart._id,
          productId: item.productId,
          variantId: item.variantId || null,
          isDeleted: false,
        });

        if (existingItem) {
          // merge quantity
          existingItem.quantity += item.quantity;
          existingItem.totalPrice = existingItem.quantity * existingItem.price;
          await existingItem.save();
        } else {
          // move item to user cart
          await this.cartItemModel.create({
            cartId: userCart._id,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            totalPrice: item.totalPrice,
          });
        }
      }

      // delete guest cart
      await this.cartModel.findByIdAndUpdate(guestCart._id, {
        isDeleted: true,
        isActive: false,
      });

    } else {
      // ✅ CASE 2: No user cart → assign guest cart
      await this.cartModel.findByIdAndUpdate(guestCart._id, {
        customerId,
        deviceId: null,
      });
    }
  }
  async getCart(deviceId?: string, customerId?: string) {
    try {
      console.log(deviceId, "deviceId", customerId, "customerId");

      // 🔹 1. Link guest cart → customer (after login)
      if (deviceId && customerId) {
        await this.linkDeviceCartToCustomer(deviceId, customerId);
      }

      // 🔹 2. Find cart (FIXED LOGIC)
      let cart;

      if (customerId) {
        // Logged-in user → always use customerId
        cart = await this.cartModel.findOne({
          customerId,
          isActive: true,
          isDeleted: false,
        });
      } else if (deviceId) {
        // Guest user → use deviceId
        cart = await this.cartModel.findOne({
          deviceId,
          isActive: true,
          isDeleted: false,
        });
      } else {
        throw new HttpException(
          {
            success: false,
            message: 'deviceId or customerId is required',
            statusCode: 400,
            data: null,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // 🔹 3. Create cart if not exists (FIXED)
      if (!cart) {
        cart = await this.cartModel.create({
          deviceId: customerId ? undefined : deviceId,
          customerId: customerId || undefined,
          isActive: true,
          isDeleted: false,
          totalAmount: 0,
          totalItems: 0,
        });
      }

      // 🔹 4. Populate cart
      cart = await this.cartModel
        .findById(cart._id)
        .populate('deviceId')
        .populate('customerId');
      // 🔹 👉 ADD HERE
      await this.updateCartTotals(cart._id);
      // 🔹 5. Get cart items
      const cartItems = await this.cartItemModel
        .find({ cartId: cart._id, isDeleted: false })
        .populate('productId')
        .populate('variantId');

      // 🔹 6. Collect variant IDs
      const variantIds = cartItems
        .map((item: any) => item.variantId?._id)
        .filter(Boolean);

      // 🔹 7. Fetch images (optimized)
      const allImages = await this.variantImageModel.find({
        productVariantId: { $in: variantIds },
        isDeleted: false,
      });

      // 🔹 8. Attach images to items
      const itemsWithImages = cartItems.map((item: any) => {
        const images = allImages.filter(
          (img) =>
            img.productVariantId.toString() ===
            item.variantId?._id.toString(),
        );

        return {
          ...item.toObject(),
          variantImages: images,
        };
      });

      // 🔹 9. Update totals
      await this.updateCartTotals(cart._id);

      // 🔹 10. Final response
      return {
        success: true,
        message: 'Cart fetched successfully',
        statusCode: 200,
        data: {
          cart,
          items: itemsWithImages,
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

      // 🔹 Verify product exists
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

      // 🔹 Get price from DB (IMPORTANT 🔥)
      let price = 0;

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

        price = variant.offerPrice ?? variant.salePrice ?? 0;
      } else {
        price = Number(product.price || 0);
      }

      // 🔹 Check existing item
      const existingItem = await this.cartItemModel.findOne({
        cartId,
        productId: data.productId,
        variantId: data.variantId || null,
        isDeleted: false,
      });

      if (existingItem) {
        // ✅ Update quantity
        existingItem.quantity += data.quantity;
        existingItem.price = price; // update latest price
        existingItem.totalPrice = price * existingItem.quantity;
        await existingItem.save();
      } else {
        // ✅ Create new item
        await this.cartItemModel.create({
          cartId,
          productId: data.productId,
          variantId: data.variantId,
          quantity: data.quantity,
          price,
          totalPrice: price * data.quantity,
        });
      }

      // 🔹 Update totals
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

      // 🔹 Only allow quantity update
      if (data.quantity !== undefined) {
        item.quantity = data.quantity;
      }

      // ❌ DO NOT allow price update

      // 🔹 Recalculate total
      item.totalPrice = item.price * item.quantity;

      await item.save();

      // 🔹 Update cart totals
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
      // Link guest cart to customer when coming from checkout with deviceId
      const { deviceId, ...addressData } = data;
      if (deviceId) {
        await this.linkDeviceCartToCustomer(deviceId, customerId);
      }

      // If this is set as default, unset other defaults
      if (addressData.isDefault) {
        await this.addressModel.updateMany(
          { customerId, isDefault: true },
          { $set: { isDefault: false } },
        );
      }

      const address = await this.addressModel.create({
        customerId,
        ...addressData,
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

  async getAddresses(customerId: string, deviceId?: string) {
    try {
      if (deviceId) {
        await this.linkDeviceCartToCustomer(deviceId, customerId);
      }

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
      // Link guest cart to customer when coming from checkout with deviceId
      const { deviceId, ...orderData } = data;
      if (deviceId) {
        await this.linkDeviceCartToCustomer(deviceId, customerId);
      }

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
        _id: orderData.addressId,
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
      const discountAmount = orderData.discountAmount || 0;
      const shippingCharges = orderData.shippingCharges || 0;
      const finalAmount = totalAmount - discountAmount + shippingCharges;

      // Create order
      const order = await this.orderModel.create({
        customerId,
        addressId: orderData.addressId,
        totalAmount,
        discountAmount,
        shippingCharges,
        finalAmount,
        notes: orderData.notes,
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

      const payment = await this.paymentModel
        .findOne({ orderId: order._id, customerId, isDeleted: false })
        .select('paymentStatus paymentGateway transactionId paymentDate')
        .lean();

      return {
        success: true,
        message: 'Order fetched successfully',
        statusCode: 200,
        data: {
          order,
          items,
          paymentStatus: payment?.paymentStatus ?? null,
          paymentGateway: payment?.paymentGateway ?? null,
          transactionId: payment?.transactionId ?? null,
          paymentDate: payment?.paymentDate ?? null,
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
  /** Create Razorpay order: uses payment-gateway module, creates Payment (PENDING) linked to Order, returns client payload. */
  async createRazorpayOrder(customerId: string, data: CreateRazorpayOrderDto) {
    const order = await this.orderModel.findOne({
      _id: data.orderId,
      customerId,
      isDeleted: false,
    });
    console.log(order);
    if (!order) {
      throw new HttpException(
        { success: false, message: 'Order not found', statusCode: 404, data: null },
        HttpStatus.NOT_FOUND,
      );
    }
    console.log(GATEWAY_RAZORPAY);


    const gatewayResult = await this.paymentGatewayService.createOrder(GATEWAY_RAZORPAY, {
      amount: order.finalAmount,
      currency: 'INR',
      receipt: `order_${data.orderId}`,
    });
    console.log(gatewayResult, "gatewayResult");

    const payment = await this.paymentModel.create({
      orderId: data.orderId,
      customerId,
      amount: order.finalAmount,
      paymentMethod: 'razorpay',
      paymentStatus: PaymentStatus.PENDING,
      paymentGateway: GATEWAY_RAZORPAY,
      razorpayOrderId: gatewayResult.gatewayOrderId, // link: gateway id → our Payment (and Payment.orderId → Order)
    });

    return {
      success: true,
      message: 'Razorpay order created',
      statusCode: 201,
      data: {
        razorpayOrderId: gatewayResult.gatewayOrderId,
        amount: gatewayResult.amount,
        currency: gatewayResult.currency,
        key: gatewayResult.key,
        paymentId: payment._id.toString(),
        orderId: data.orderId,
      },
    };
  }

  /** Verify Razorpay payment: uses payment-gateway module, then updates payment + order status. */
  async verifyRazorpayPayment(customerId: string, data: VerifyRazorpayPaymentDto) {
    console.log(data, "data", customerId, "customerId");

    const payment = await this.paymentModel.findOne({
      razorpayOrderId: data.razorpayOrderId,
      customerId,
      isDeleted: false,
    });
    console.log(payment, 'payment');

    if (!payment) {
      throw new HttpException(
        { success: false, message: 'Payment record not found', statusCode: 404, data: null },
        HttpStatus.NOT_FOUND,
      );
    }
    console.log(data, "data", payment.razorpayOrderId, "payment.razorpayOrderId", GATEWAY_RAZORPAY);

    const verifyResult = await this.paymentGatewayService.verifySignature(GATEWAY_RAZORPAY, {
      gatewayOrderId: data.razorpayOrderId,
      gatewayPaymentId: data.razorpayPaymentId,
      signature: data.razorpaySignature,
    });
    console.log(verifyResult, "verifyResultˇˇˇˇß");

    if (!verifyResult.success) {
      await this.paymentModel.findByIdAndUpdate(payment._id, {
        paymentStatus: PaymentStatus.FAILED,
        failureReason: verifyResult.failureReason || 'Verification failed',
      });
      throw new HttpException(
        {
          success: false,
          message: 'Payment verification failed',
          statusCode: 400,
          data: { paymentStatus: PaymentStatus.FAILED },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.paymentModel.findByIdAndUpdate(payment._id, {
      paymentStatus: PaymentStatus.SUCCESS,
      transactionId: verifyResult.transactionId,
      paymentDate: new Date(),
      failureReason: undefined,
    });
    await this.orderModel.findByIdAndUpdate(payment.orderId, { orderStatus: 'confirmed' }); // link: Payment.orderId → update Order

    const updated = await this.paymentModel.findById(payment._id).lean();
    return {
      success: true,
      message: 'Payment verified successfully',
      statusCode: 200,
      data: {
        paymentStatus: PaymentStatus.SUCCESS,
        payment: updated,
        orderStatus: 'confirmed',
      },
    };
  }

  /** Get payment status by our payment id (for polling or order page). */
  async getPaymentStatus(customerId: string, paymentId: string) {
    const payment = await this.paymentModel
      .findOne({ _id: paymentId, customerId, isDeleted: false })
      .populate('orderId')
      .lean();
    if (!payment) {
      throw new HttpException(
        { success: false, message: 'Payment not found', statusCode: 404, data: null },
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      success: true,
      message: 'Payment status fetched',
      statusCode: 200,
      data: {
        paymentId: payment.paymentId,
        paymentStatus: payment.paymentStatus,
        orderId: payment.orderId,
        amount: payment.amount,
        paymentGateway: payment.paymentGateway,
        transactionId: payment.transactionId,
        paymentDate: payment.paymentDate,
      },
    };
  }

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



  async createCarouselImages(imageUrls: string[]) {
    try {
      const docs = imageUrls.map(url => ({
        imageUrl: url,
        isActive: true,
        createdAt: new Date(),
      }));

      const created = await this.carouselModel.insertMany(docs);

      return {
        success: true,
        message: "Carousel images uploaded successfully",
        data: created,
      };

    } catch (err) {
      console.error("Error in createCarouselImages:", err);
      throw new HttpException(
        "Failed to upload carousel images",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getCarouselImages() {
    try {
      const data = await this.carouselModel
        .find({ isActive: true })
        .sort({ createdAt: -1 })
        .lean();

      return {
        success: true,
        data,
      };

    } catch (err) {
      throw new HttpException(
        "Failed to fetch carousel images",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async deleteCarousel(id: string) {
    try {
      const exists = await this.carouselModel.findById(id);

      if (!exists) {
        throw new NotFoundException("Carousel image not found");
      }

      await this.carouselModel.findByIdAndDelete(id);

      return {
        success: true,
        message: "Carousel image deleted successfully",
      };

    } catch (err) {
      throw err instanceof HttpException
        ? err
        : new HttpException(
          "Failed to delete carousel image",
          HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
  }

}

