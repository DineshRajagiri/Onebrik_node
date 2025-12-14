import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { commonDTO } from "src/common/DTO/commonDTO";
import mongoose, { Document, } from "mongoose";
import { productVariants } from "./productVariants.schema";
import { attributes } from "./attributes.schema";
import { attributesValues } from "./attributesValues.schema";

export type VariantAttributeValuesDocument = VariantAttributeValues & Document;

@Schema()
export class VariantAttributeValues extends commonDTO {

    @Prop({ type: String, ref: "productVariants" })
    productVariantId: productVariants;

    @Prop({ type: String, ref: "attributes" })
    attributeId: attributes;

    @Prop({ type: String, ref: "attributesValues" })
    attributeValuesId: attributesValues;

  



}
export const VariantAttributeValuesSchemaFile = SchemaFactory.createForClass(VariantAttributeValues);
