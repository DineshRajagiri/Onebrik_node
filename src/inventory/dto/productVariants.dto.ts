import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, } from "mongoose";
import { inventoryCategory } from "src/schema/inventoryCategory.schema";
import { Product } from "src/schema/products.schema";
import { VariantAttributeItem } from "./variantAttributeValues.dto";

export class productVariantsDTO {
  @Prop()
  productId: string;

  @Prop()
  variantName: string;

  @Prop()
  stock: string;

  @Prop()
  variantSku: string;

  @Prop()
  salePrice: number;

  @Prop()
  offerPrice: number;


  attributes?: VariantAttributeItem[];
}
