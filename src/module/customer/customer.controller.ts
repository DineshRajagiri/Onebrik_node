import {BadRequestException,Body,Controller,Delete,Get,HttpException,HttpStatus,Inject,Param,Post,Put,Query,Req,UploadedFiles,UseGuards,UseInterceptors,
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
import { CreateRazorpayOrderDto, VerifyRazorpayPaymentDto } from './dto/razorpay.dto';
import { Request } from 'express';
import { Public } from 'src/decorators/public.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt.guard';
import { AwsS3BucketService } from 'src/common/services/aws-s3-bucket/aws-s3-bucket.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

// Simple guard to extract customer ID from token (you can enhance this)
@Controller('customer')
export class CustomerController {
  constructor(
    @Inject(Services.CUSTOMER) private customerService: ICustomerService,
    private readonly awsS3BucketService: AwsS3BucketService,)
   { }

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
// Cart: guest by deviceId (no JWT). Logged in: link by passing deviceId on first address/order call.
// ==============================
/** Logged-in user: get my cart (use after linking via address/order with deviceId). JWT required. */
@UseGuards(JwtAuthGuard)
@Get('cart/me')
async getMyCart(@Req() req: Request & { user?: { id: string } }) {
  const customerId = req.user?.id;
  if (!customerId) {
    throw new HttpException(
      { success: false, message: 'Unauthorized', statusCode: 401, data: null },
      HttpStatus.UNAUTHORIZED,
    );
  }
  return this.customerService.getCart(undefined, customerId);
}

/** With JWT + deviceId: link guest cart to account and return my cart. Without JWT: guest cart by deviceId. */
@Public()
@UseGuards(OptionalJwtAuthGuard)
@Get('cart')
async getCart(
  @Query('deviceId') deviceId: string | undefined,
  @Req() req: Request & { user?: { id: string } },
) {
  const customerId = req.user?.id;
  return this.customerService.getCart(deviceId, customerId);
}

// ==============================
// CART ITEM ENDPOINTS (no JWT – use cartId from getCart)
// ==============================
@Public()
@Post('cart/:cartId/items')
async addCartItem(
  @Param('cartId') cartId: string,
  @Body() body: CreateCartItemDto,
) {
  return this.customerService.addCartItem(cartId, body);
}

@Public()
@Put('cart/items/:itemId')
async updateCartItem(
  @Param('itemId') itemId: string,
  @Body() body: UpdateCartItemDto,
) {
  return this.customerService.updateCartItem(itemId, body);
}

@Public()
@Delete('cart/items/:itemId')
async deleteCartItem(@Param('itemId') itemId: string) {
  return this.customerService.deleteCartItem(itemId);
}

// ==============================
// ADDRESS ENDPOINTS (JWT required)
// Optional deviceId links guest cart to customer when user hits address/order after login.
// ==============================
@Post('address')
async createAddress(
  @Body() body: CreateAddressDto,
  @Req() req: Request & { user?: { id: string } },
) {
  const customerId = req.user?.id;
  if (!customerId) {
    throw new HttpException(
      {
        success: false,
        message: 'Unauthorized',
        statusCode: 401,
        data: null,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
  return this.customerService.createAddress(customerId as string, body);
}

@Get('address')
async getAddresses(
  @Query('deviceId') deviceId: string | undefined,
  @Req() req: Request & { user?: { id: string } },
) {
  const customerId = req.user?.id;
  if (!customerId) {
    throw new HttpException(
      {
        success: false,
        message: 'Unauthorized',
        statusCode: 401,
        data: null,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
  return this.customerService.getAddresses(customerId as string, deviceId);
}

@Put('address/:addressId')
async updateAddress(
  @Param('addressId') addressId: string,
  @Body() body: UpdateAddressDto,
  @Req() req: Request & { user?: { id: string } },
) {
  const customerId = req.user?.id;
  if (!customerId) {
    throw new HttpException(
      {
        success: false,
        message: 'Unauthorized',
        statusCode: 401,
        data: null,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
  return this.customerService.updateAddress(addressId, customerId as string, body);
}

@Delete('address/:addressId')
async deleteAddress(
  @Param('addressId') addressId: string,
  @Req() req: Request & { user?: { id: string } },
) {
  const customerId = req.user?.id;
  if (!customerId) {
    throw new HttpException(
      {
        success: false,
        message: 'Unauthorized',
        statusCode: 401,
        data: null,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
  return this.customerService.deleteAddress(addressId, customerId as string);
}

// ==============================
// ORDER ENDPOINTS
// ==============================
@Post('order')
async createOrder(
  @Body() body: CreateOrderDto,
  @Req() req: Request & { user?: { id: string } },
) {
  const customerId = req.user?.id;
  if (!customerId) {
    throw new HttpException(
      {
        success: false,
        message: 'Unauthorized',
        statusCode: 401,
        data: null,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
  return this.customerService.createOrder(customerId as string, body);
}

@Get('order/history')
async getOrderHistory(
  @Query('page') page: number,
  @Query('limit') limit: number,
  @Req() req: Request & { user?: { id: string } },
) {
  const customerId = req.user?.id;
  if (!customerId) {
    throw new HttpException(
      {
        success: false,
        message: 'Unauthorized',
        statusCode: 401,
        data: null,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
  return this.customerService.getOrderHistory(
    customerId as string,
    Number(page) || 1,
    Number(limit) || 10,
  );
}

@Get('order/:orderId')
async getOrderById(
  @Param('orderId') orderId: string,
  @Req() req: Request & { user?: { id: string } },
) {
  const customerId = req.user?.id;
  if (!customerId) {
    throw new HttpException(
      {
        success: false,
        message: 'Unauthorized',
        statusCode: 401,
        data: null,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
  return this.customerService.getOrderById(orderId, customerId as string);
}

// ==============================
// PAYMENT ENDPOINTS (JWT required)
// Razorpay: create-order → client pays → verify. Use GET payment/status/:paymentId for status.
// ==============================
@Post('payment')
async createPayment(
  @Body() body: CreatePaymentDto,
  @Req() req: Request & { user?: { id: string } },
) {
  const customerId = req.user?.id;
  if (!customerId) {
    throw new HttpException(
      {
        success: false,
        message: 'Unauthorized',
        statusCode: 401,
        data: null,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
  return this.customerService.createPayment(customerId as string, body);
}

/** Create Razorpay order for an order. Returns key + razorpayOrderId for client checkout. */
@Post('payment/razorpay/create-order')
async createRazorpayOrder(
  @Body() body: CreateRazorpayOrderDto,
  @Req() req: Request & { user?: { id: string } },
) {
  const customerId = req.user?.id;
  if (!customerId) {
    throw new HttpException(
      { success: false, message: 'Unauthorized', statusCode: 401, data: null },
      HttpStatus.UNAUTHORIZED,
    );
  }
  return this.customerService.createRazorpayOrder(customerId as string, body);
}

/** Verify Razorpay payment after client checkout. Updates payment status and order status. */
@Post('payment/razorpay/verify')
async verifyRazorpayPayment(
  @Body() body: VerifyRazorpayPaymentDto,
  @Req() req: Request & { user?: { id: string } },
) {
  const customerId = req.user?.id;
  if (!customerId) {
    throw new HttpException(
      { success: false, message: 'Unauthorized', statusCode: 401, data: null },
      HttpStatus.UNAUTHORIZED,
    );
  }
  return this.customerService.verifyRazorpayPayment(customerId as string, body);
}

/** Get payment status (PENDING | SUCCESS | FAILED). */
@Get('payment/status/:paymentId')
async getPaymentStatus(
  @Param('paymentId') paymentId: string,
  @Req() req: Request & { user?: { id: string } },
) {
  const customerId = req.user?.id;
  if (!customerId) {
    throw new HttpException(
      { success: false, message: 'Unauthorized', statusCode: 401, data: null },
      HttpStatus.UNAUTHORIZED,
    );
  }
  return this.customerService.getPaymentStatus(customerId as string, paymentId);
}




@Public()
@Post('uploadCarouselImages')
@UseInterceptors(
  FilesInterceptor('images', 10, {
    storage: memoryStorage(), // IMPORTANT for S3
  }),
)
async uploadCarouselImages(
  @UploadedFiles() files: Express.Multer.File[],
) {
  if (!files || files.length === 0) {
    throw new BadRequestException("No images uploaded");
  }

  const uploadPromises = files.map(file =>
    this.awsS3BucketService.uploadFile(file, 'carousel')
  );

  const imageUrls = await Promise.all(uploadPromises);

  return this.customerService.createCarouselImages(imageUrls);
}

@Public()
@Get('getCarouselImages')
async getCarouselImages() {
  return this.customerService.getCarouselImages();
}

@Public()
@Delete('deleteCarousel/:id')
async deleteCarousel(@Param('id') id: string) {
  return this.customerService.deleteCarousel(id);
}
}

