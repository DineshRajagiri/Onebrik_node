import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import {
  GatewayType,
  IPaymentGateway,
  CreateOrderGatewayParams,
  CreateOrderGatewayResult,
  VerifyPaymentGatewayParams,
  VerifyPaymentGatewayResult,
} from './payment-gateway.interface';
import { GATEWAY_RAZORPAY } from './payment-gateway.interface';
import { RazorpayGatewayService } from './gateways/razorpay.gateway';

@Injectable()
export class PaymentGatewayService {
  private readonly gateways: Map<string, IPaymentGateway> = new Map();

  constructor(private readonly razorpayGateway: RazorpayGatewayService) {
    this.gateways.set(GATEWAY_RAZORPAY, this.razorpayGateway);
  }

  /** Get gateway by type. Use this to call createOrder / verifySignature. */
  getGateway(type: GatewayType): IPaymentGateway {
    const gateway = this.gateways.get(type);
    if (!gateway) {
      throw new HttpException(
        { success: false, message: `Unsupported payment gateway: ${type}`, statusCode: 400 },
        HttpStatus.BAD_REQUEST,
      );
    }
    return gateway;
  }

  async createOrder(
    gatewayType: GatewayType,
    params: CreateOrderGatewayParams,
  ): Promise<CreateOrderGatewayResult> {
    return this.getGateway(gatewayType).createOrder(params);
  }

  async verifySignature(
    gatewayType: GatewayType,
    params: VerifyPaymentGatewayParams,
  ): Promise<VerifyPaymentGatewayResult> {
    return this.getGateway(gatewayType).verifySignature(params);
  }
}
