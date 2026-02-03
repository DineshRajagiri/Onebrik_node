import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { productVariants } from "src/schema/productVariants.schema";


export class VariantAttributeItem {

  @ApiProperty({
    example: 'e8027458-103f-4042-93ab-0d5f1ec87a62',
    description: 'Attribute ID (e.g. size, color)',
  })
  @IsString()
  @IsNotEmpty()
  attributeId: string;

  @ApiProperty({
    example: 'bf0ed883-2425-4933-aa70-470d25c9ff6e',
    description: 'Attribute Value ID (e.g. M, Red)',
  })
  @IsString()
  @IsNotEmpty()
  attributeValuesId: string;
}
export class VariantAttributeValuesDTO {

  @ApiProperty({
    example: '0dd19c97-e12d-468b-af95-2fa7d0f3cddd',
    description: 'Product Variant ID',
  })
  @IsString()
  @IsNotEmpty()
  productVariantId: string;

  @ApiProperty({
    type: [VariantAttributeValuesDTO],
    description: 'List of attributes for the variant',
    example: [
      {
        attributeId: 'e8027458-103f-4042-93ab-0d5f1ec87a62',
        attributeValuesId: 'bf0ed883-2425-4933-aa70-470d25c9ff6e'
      }
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantAttributeItem)
  attributes: VariantAttributeItem[];
}


