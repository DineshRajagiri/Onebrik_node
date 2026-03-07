/**
 * Payment Gateway Module
 *
 * Single place for all payment gateway integrations. Customer (and other modules) only
 * call PaymentGatewayService; they do not import Razorpay/Stripe etc.
 *
 * To add a new gateway (e.g. Stripe):
 * 1. Add GATEWAY_STRIPE = 'stripe' and type in payment-gateway.interface.ts
 * 2. Create gateways/stripe.gateway.ts implementing IPaymentGateway
 * 3. Register in payment-gateway.service.ts constructor: this.gateways.set(GATEWAY_STRIPE, stripeGateway)
 * 4. Inject StripeGatewayService in payment-gateway.module.ts and pass to PaymentGatewayService
 */

export * from './payment-gateway.interface';
export * from './payment-gateway.service';
export * from './payment-gateway.module';
