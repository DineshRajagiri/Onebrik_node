import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { productVariants } from "src/schema/productVariants.schema";

export class VariantAttributeValuesDTO {
    @Prop({ type: String, ref: "productVariant" })
    productVariantId: productVariants;

     attributes: {
    attributeId: string;
    attributeValuesId: string;
  }[];
}
