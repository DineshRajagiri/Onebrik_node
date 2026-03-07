import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  addressId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingCharges?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  /** If sent, guest cart for this device is linked to the logged-in customer before creating order. */
  @IsOptional()
  @IsString()
  deviceId?: string;
}


