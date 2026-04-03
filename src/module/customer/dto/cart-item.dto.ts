import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateCartItemDto {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  variantId?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;

  // @IsNotEmpty()
  // @IsNumber()
  // price: number;
}

export class UpdateCartItemDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  // @IsOptional()
  // @IsNumber()
  // price?: number;
}


