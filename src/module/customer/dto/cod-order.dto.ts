import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class PlaceCodOrderDto {
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

  /** Pass deviceId to link a guest cart to the logged-in customer before placing order. */
  @IsOptional()
  @IsString()
  deviceId?: string;
}
