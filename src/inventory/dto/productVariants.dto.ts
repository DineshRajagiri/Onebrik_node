import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { VariantAttributeItem } from "./variantAttributeValues.dto";

export class productVariantsDTO {
  @IsNotEmpty()
  @IsString()
  productId: string;
  
  @IsNotEmpty()
  @IsString()
  variantName: string;
  
  @IsNotEmpty()
  @IsString()
  stock: string;

  @IsOptional()
  @IsString()
  variantSku: string;
  
  @IsNotEmpty()
  @IsNumber()
  salePrice: number;
  
  @IsNotEmpty()
  @IsNumber()
  offerPrice: number;

  @IsOptional()
  attributes?: VariantAttributeItem[];
}
