import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested } from "class-validator";
import { VariantAttributeItem } from "./variantAttributeValues.dto";
import { Type } from "class-transformer";

export class FullVariantDTO {

    @ApiProperty({ example: 'Red 90m' })
    @IsString()
    @IsNotEmpty()
    variantName: string;

    @ApiProperty({ example: '10' })
    @IsString()
    stock: string;

    @ApiProperty({ example: 999 })
    salePrice: number;

    @ApiProperty({ example: 899 })
    offerPrice: number;

    @Prop() variantSku?: string;
    @ApiProperty({ type: [VariantAttributeItem] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => VariantAttributeItem)
    attributes: VariantAttributeItem[];

    @ApiProperty({
        example: [
            'http://localhost:3002/uploads/variant-images/img1.jpeg',
            'http://localhost:3002/uploads/variant-images/img2.jpeg',
        ],
    })
    @IsArray()
    images: string[];
}

export class CreateFullProductDTO {

    @ApiProperty({ example: 'Fin tech' })
    @IsString()
    @IsNotEmpty()
    productName: string;

    @ApiProperty({ example: 'Finolex' })
    @IsString()
    brand: string;

    @ApiProperty({ example: 'High quality pipe' })
    @IsString()
    description: string;

    @ApiProperty({example:'Finolex pipes are known for durability, strength, and long life usage in electrical and plumbing applications.',})
    @IsString()
    about: string;

    @ApiProperty({ example: '999' })
    @IsString()
    price: string; 

    @ApiProperty({ example: 4.5 })
    @IsNumber()
    rating: number;

    @ApiProperty({ example: 10 })
    @IsNumber()
    discount: number;

    @ApiProperty({ example: '10% OFF' })
    @IsString()
    offer: string;

    @Prop() sku?: string;
    @IsString()
    @ApiProperty({ type: String, description: 'This is a required property', required: true, example: '64f7c2e8b4d1c2a1b2c3d4e5' })
    mainCategoryId?: string;

    @ApiProperty({ type: String, description: 'This is a required property', required: true, example: '64f7c2e8b4d1c2a1b2c3d4e5' })
    @IsString()
    subCategoryId?: string;

    @ApiProperty({ type: String, description: 'This is a required property', required: true, example: '64f7c2e8b4d1c2a1b2c3d4e5' })
    @IsString()
    subChildCategoryId?: string;

    @ApiProperty({
        type: [FullVariantDTO],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FullVariantDTO)
    variants: FullVariantDTO[];
}

