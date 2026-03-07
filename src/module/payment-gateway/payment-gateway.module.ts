import { Module } from '@nestjs/common';
import { PaymentGatewayService } from './payment-gateway.service';
import { RazorpayGatewayService } from './gateways/razorpay.gateway';
import { Services } from 'src/utils/constants';

@Module({
  providers: [
    RazorpayGatewayService,
    {
      provide: Services.PAYMENT_GATEWAY,
      useClass: PaymentGatewayService,
    },
  ],
  exports: [Services.PAYMENT_GATEWAY],
})
export class PaymentGatewayModule {}
