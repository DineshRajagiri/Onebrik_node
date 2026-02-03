import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, } from "mongoose";
import { inventoryCategory } from "src/schema/inventoryCategory.schema";
import { Product } from "src/schema/products.schema";
import { VariantAttributeItem } from "./variantAttributeValues.dto";
import Api from "twilio/lib/rest/Api";
import { ApiProperty } from "@nestjs/swagger";

export class productVariantsDTO {
  @ApiProperty({ type: String, description: 'This is a required property', required: true, example: '64f7c2e8b4d1c2a1b2c3d4e5' })
  @Prop()
  productId: string;
  @ApiProperty({ type: String, description: 'This is a required property', required: true, example: 'Red Color Variant' })
  @Prop()
  variantName: string;
  @ApiProperty({ type: String, description: 'This is a required property', required: true, example: '100' })
  @Prop()
  stock: string;

  @Prop()
  variantSku: string;
  @ApiProperty({ type: Number, description: 'This is a required property', required: true, example: 199.99 })
  @Prop()
  salePrice: number;
  @ApiProperty({ type: Number, description: 'This is a required property', required: true, example: 149.99 })
  @Prop()
  offerPrice: number;


  attributes?: VariantAttributeItem[];
}
