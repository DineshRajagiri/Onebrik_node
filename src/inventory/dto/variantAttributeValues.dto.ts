import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { productVariants } from "src/schema/productVariants.schema";

export interface VariantAttributeItem {
  attributeId: string;
  attributeValuesId: string;
}

export class VariantAttributeValuesDTO {
  productVariantId: string;          // ✅ string ID
  attributes: VariantAttributeItem[];
}


