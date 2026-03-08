/** Supported payment gateway identifiers. Add new gateways here. */
export const GATEWAY_RAZORPAY = 'razorpay';
export type GatewayType = typeof GATEWAY_RAZORPAY | string;

export interface CreateOrderGatewayParams {
  amount: number; // in currency units (e.g. INR)
  currency: string;
  receipt: string;
  /** Optional metadata for the gateway */
  metadata?: Record<string, string>;
}

export interface CreateOrderGatewayResult {
  gatewayOrderId: string;
  /** Client key / publishable key for frontend checkout */
  key: string;
  amount: number; // in smallest unit (e.g. paise for INR)
  currency: string;
  /** Gateway-specific payload for client (e.g. options for Razorpay Checkout) */
  extra?: Record<string, unknown>;
}

export interface VerifyPaymentGatewayParams {
  gatewayOrderId: string;
  gatewayPaymentId: string;
  signature: string;
}

export interface VerifyPaymentGatewayResult {
  success: boolean;
  transactionId?: string;
  failureReason?: string;
}

/** Implement per gateway (Razorpay, Stripe, etc.). */
export interface IPaymentGateway {
  createOrder(params: CreateOrderGatewayParams): Promise<CreateOrderGatewayResult>;
  verifySignature(params: VerifyPaymentGatewayParams): Promise<VerifyPaymentGatewayResult>;
  /** Human-readable name for errors */
  readonly name: string;
}
