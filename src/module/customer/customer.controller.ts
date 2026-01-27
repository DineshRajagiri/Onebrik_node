import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Services } from 'src/utils/constants';
import { ICustomerService } from './customer.interface';
import { CreateDeviceDto } from './dto/create-device.dto';
import { CreateCartItemDto, UpdateCartItemDto } from './dto/cart-item.dto';
import { CustomerRegisterDto, CustomerLoginDto } from './dto/customer-auth.dto';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { CreatePaymentDto } from './dto/payment.dto';
import { CreateOrderDto } from './dto/order.dto';
import { GetItemsDto } from './dto/get-items.dto';
import { Request } from 'express';
import { Public } from 'src/decorators/public.decorator';

// Simple guard to extract customer ID from token (you can enhance this)
@Controller('customer')
export class CustomerController {
  constructor(
    @Inject(Services.CUSTOMER) private customerService: ICustomerService,
  ) {}

  // ==============================
  // PRODUCTS/ITEMS ENDPOINTS
  // ==============================
  @Public()
  @Get('items')
  async getItems(@Query() query: GetItemsDto) {
    return this.customerService.getItems(query);
  }

  // ==============================
  // DEVICE ENDPOINTS
  // ==============================
  @Public()
  @Post('device/create')
  async createDevice(@Body() body: CreateDeviceDto) {
    return this.customerService.createDevice(body);
  }

  // ==============================
  // CART ENDPOINTS
  // ==============================
  @Public()
  @Post('cart/activate')
  async activateCart(
    @Body() body: { deviceId?: string; customerId?: string },
  ) {
    return this.customerService.activateCart(body.deviceId, body.customerId);
  }

  @Get('cart')
  @Public()
  async getCart(
    @Query('deviceId') deviceId?: string,
    @Query('customerId') customerId?: string,
  ) {
    return this.customerService.getCart(deviceId, customerId);
  }

  // ==============================
  // CART ITEM ENDPOINTS
  // ==============================
  @Post('cart/:cartId/items')
  @Public()
  async addCartItem(
    @Param('cartId') cartId: string,
    @Body() body: CreateCartItemDto,
  ) {
    return this.customerService.addCartItem(cartId, body);
  }

  @Put('cart/items/:itemId')
  @Public()
  async updateCartItem(
    @Param('itemId') itemId: string,
    @Body() body: UpdateCartItemDto,
  ) {
    return this.customerService.updateCartItem(itemId, body);
  }

  @Delete('cart/items/:itemId')
  @Public()
  async deleteCartItem(@Param('itemId') itemId: string) {
    return this.customerService.deleteCartItem(itemId);
  }

  // ==============================
  // CUSTOMER AUTH ENDPOINTS
  // ==============================
  @Post('register')
  @Public()
  async registerCustomer(@Body() body: CustomerRegisterDto) {
    return this.customerService.registerCustomer(body);
  }

  @Post('login')
  @Public()
  async loginCustomer(@Body() body: CustomerLoginDto) {
    return this.customerService.loginCustomer(body);
  }

  // ==============================
  // ADDRESS ENDPOINTS
  // ==============================
  @Post('address')
  @Public()
  async createAddress(
    @Body() body: CreateAddressDto,
    @Req() req: Request & { customerId?: string },
  ) {
    const customerId = req.customerId || (body as any).customerId;
    if (!customerId) {
      throw new HttpException(
        {
          success: false,
          message: 'Customer ID is required',
          statusCode: 400,
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.customerService.createAddress(customerId, body);
  }

  @Get('address')
  @Public()
  async getAddresses(@Req() req: Request & { customerId?: string }) {
    const customerId = req.customerId || (req.query as any).customerId;
    if (!customerId) {
      throw new HttpException(
        {
          success: false,
          message: 'Customer ID is required',
          statusCode: 400,
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.customerService.getAddresses(customerId as string);
  }

  @Put('address/:addressId')
  @Public()
  async updateAddress(
    @Param('addressId') addressId: string,
    @Body() body: UpdateAddressDto,
    @Req() req: Request & { customerId?: string },
  ) {
    const customerId = req.customerId || (body as any).customerId;
    if (!customerId) {
      throw new HttpException(
        {
          success: false,
          message: 'Customer ID is required',
          statusCode: 400,
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.customerService.updateAddress(addressId, customerId as string, body);
  }

  @Delete('address/:addressId')
  @Public()
  async deleteAddress(
    @Param('addressId') addressId: string,
    @Req() req: Request & { customerId?: string },
  ) {
    const customerId = req.customerId || (req.query as any).customerId;
    if (!customerId) {
      throw new HttpException(
        {
          success: false,
          message: 'Customer ID is required',
          statusCode: 400,
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.customerService.deleteAddress(addressId, customerId as string);
  }

  // ==============================
  // ORDER ENDPOINTS
  // ==============================
  @Post('order')  
  @Public()
  async createOrder(
    @Body() body: CreateOrderDto,
    @Req() req: Request & { customerId?: string },
  ) {
    const customerId = req.customerId || (body as any).customerId;
    if (!customerId) {
      throw new HttpException(
        {
          success: false,
          message: 'Customer ID is required',
          statusCode: 400,
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.customerService.createOrder(customerId as string, body);
  }

  @Get('order/history')
  @Public()
  async getOrderHistory(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Req() req: Request & { customerId?: string },
  ) {
    const customerId = req.customerId || (req.query as any).customerId;
    if (!customerId) {
      throw new HttpException(
        {
          success: false,
          message: 'Customer ID is required',
          statusCode: 400,
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.customerService.getOrderHistory(
      customerId as string,
      Number(page) || 1,
      Number(limit) || 10,
    );
  }

  @Get('order/:orderId')  
  @Public()
  async getOrderById(
    @Param('orderId') orderId: string,
    @Req() req: Request & { customerId?: string },
  ) {
    const customerId = req.customerId || (req.query as any).customerId;
    if (!customerId) {
      throw new HttpException(
        {
          success: false,
          message: 'Customer ID is required',
          statusCode: 400,
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.customerService.getOrderById(orderId, customerId as string);
  }

  // ==============================
  // PAYMENT ENDPOINTS
  // ==============================
  @Post('payment')
  @Public()
  async createPayment(
    @Body() body: CreatePaymentDto,
    @Req() req: Request & { customerId?: string },
  ) {
    const customerId = req.customerId || (body as any).customerId;
    if (!customerId) {
      throw new HttpException(
        {
          success: false,
          message: 'Customer ID is required',
          statusCode: 400,
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.customerService.createPayment(customerId as string, body);
  }
}

