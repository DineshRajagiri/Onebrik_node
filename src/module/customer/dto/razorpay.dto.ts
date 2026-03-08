import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/** Create Razorpay order for an existing app order. Returns razorpay order_id for client checkout. */
export class CreateRazorpayOrderDto {
  @IsNotEmpty()
  @IsString()
  orderId: string; // Our internal order _id
}

/** Sent by client after Razorpay checkout. Verify signature and update payment + order status. */
export class VerifyRazorpayPaymentDto {
  @IsNotEmpty()
  @IsString()
  razorpayOrderId: string;

  @IsNotEmpty()
  @IsString()
  razorpayPaymentId: string;

  @IsNotEmpty()
  @IsString()
  razorpaySignature: string;

  @IsOptional()
  @IsString()
  orderId?: string; // Our internal order _id (optional, can be looked up from payment record)
}
