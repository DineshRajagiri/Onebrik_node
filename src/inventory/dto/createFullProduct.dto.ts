import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { VariantAttributeItem } from "./variantAttributeValues.dto";
import { Type } from "class-transformer";

export class FullVariantDTO {
    @IsString()
    @IsNotEmpty()
    variantName: string;

    @IsString()
    @IsNotEmpty()
    stock: string;

    @IsNumber()
    @IsNotEmpty()
    salePrice: number;

    @IsNumber()
    @IsNotEmpty()
    offerPrice: number;

    @IsOptional()
    @IsString()
    variantSku?: string;
    
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => VariantAttributeItem)
    attributes: VariantAttributeItem[];

    @IsArray()
    @IsString({ each: true })
    images: string[];
}

export class CreateFullProductDTO {
    @IsString()
    @IsNotEmpty()
    productName: string;

    @IsString()
    @IsOptional()
    brand: string;

    @IsString()
    @IsOptional()
    description: string;

    @IsString()
    @IsOptional()
    about: string;

    @IsString()
    @IsOptional()
    price: string; 

    @IsNumber()
    @IsOptional()
    rating: number;

    @IsNumber()
    @IsOptional()
    discount: number;

    @IsString()
    @IsOptional()
    offer: string;

    @IsOptional()
    @IsString()
    sku?: string;
    
    @IsString()
    @IsOptional()
    mainCategoryId?: string;

    @IsString()
    @IsOptional()
    subCategoryId?: string;

    @IsString()
    @IsOptional()
    subChildCategoryId?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FullVariantDTO)
    variants: FullVariantDTO[];
}

