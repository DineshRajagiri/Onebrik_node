import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as crypto from 'crypto';
import Razorpay = require('razorpay');
import {
  IPaymentGateway,
  CreateOrderGatewayParams,
  CreateOrderGatewayResult,
  VerifyPaymentGatewayParams,
  VerifyPaymentGatewayResult,
} from '../payment-gateway.interface';

@Injectable()
export class RazorpayGatewayService implements IPaymentGateway {
  readonly name = 'razorpay';

  private getConfig() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new HttpException(
        { success: false, message: 'Razorpay is not configured', statusCode: 503 },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    return { keyId, keySecret };
  }

  async createOrder(params: CreateOrderGatewayParams): Promise<CreateOrderGatewayResult> {
    const { keyId, keySecret } = this.getConfig();
    const amountInPaise = Math.round(params.amount * 100);
    if (amountInPaise < 100) {
      throw new HttpException(
        { success: false, message: 'Amount too low for Razorpay', statusCode: 400 },
        HttpStatus.BAD_REQUEST,
      );
    }
    const instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await instance.orders.create({
      amount: amountInPaise,
      currency: params.currency || 'INR',
      receipt: params.receipt,
    });
    return {
      gatewayOrderId: order.id,
      key: keyId,
      amount: amountInPaise,
      currency: params.currency || 'INR',
      extra: { razorpayOrderId: order.id },
    };
  }

  async verifySignature(params: VerifyPaymentGatewayParams): Promise<VerifyPaymentGatewayResult> {
    const { keySecret } = this.getConfig();
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${params.gatewayOrderId}|${params.gatewayPaymentId}`)
      .digest('hex');
    if (expectedSignature !== params.signature) {
      return { success: false, failureReason: 'Invalid signature' };
    }
    return { success: true, transactionId: params.gatewayPaymentId };
  }
}
