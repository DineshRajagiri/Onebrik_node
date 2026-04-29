import { CreateDeviceDto } from './dto/create-device.dto';
import { CreateCartItemDto, UpdateCartItemDto } from './dto/cart-item.dto';
import { CustomerRegisterDto, CustomerLoginDto } from './dto/customer-auth.dto';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { CreatePaymentDto } from './dto/payment.dto';
import { CreateOrderDto } from './dto/order.dto';
import { PlaceCodOrderDto } from './dto/cod-order.dto';
import { CreateRazorpayOrderDto, VerifyRazorpayPaymentDto } from './dto/razorpay.dto';
import { GetItemsDto } from './dto/get-items.dto';

export interface ICustomerService {
  createDevice(data: CreateDeviceDto): Promise<any>;
  getCart(deviceId?: string, customerId?: string): Promise<any>;
  addCartItem(cartId: string, data: CreateCartItemDto): Promise<any>;
  updateCartItem(itemId: string, data: UpdateCartItemDto): Promise<any>;
  deleteCartItem(itemId: string): Promise<any>;
  registerCustomer(data: CustomerRegisterDto): Promise<any>;
  loginCustomer(data: CustomerLoginDto): Promise<any>;
  createAddress(customerId: string, data: CreateAddressDto): Promise<any>;
  getAddresses(customerId: string, deviceId?: string): Promise<any>;
  updateAddress(addressId: string, customerId: string, data: UpdateAddressDto): Promise<any>;
  deleteAddress(addressId: string, customerId: string): Promise<any>;
  createOrder(customerId: string, data: CreateOrderDto): Promise<any>;
  placeCodOrder(customerId: string, data: PlaceCodOrderDto): Promise<any>;
  getOrderHistory(customerId: string, page?: number, limit?: number): Promise<any>;
  getOrderById(orderId: string, customerId: string): Promise<any>;
  createPayment(customerId: string, data: CreatePaymentDto): Promise<any>;
  createRazorpayOrder(customerId: string, data: CreateRazorpayOrderDto): Promise<any>;
  verifyRazorpayPayment(customerId: string, data: VerifyRazorpayPaymentDto): Promise<any>;
  getPaymentStatus(customerId: string, paymentId: string): Promise<any>;
  getItems(query: GetItemsDto): Promise<any>;
  createCarouselImages(imageUrls: string[]): Promise<any>;
  getCarouselImages(): Promise<any>;
  deleteCarousel(id: string): Promise<any>;
}

