import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { commonDTO } from "src/common/DTO/commonDTO";
import mongoose, { Document, } from "mongoose";
import { inventoryCategory } from "./inventoryCategory.schema";
import { products } from "./products.schema";

export type VariantAttributeValuesDocument = VariantAttributeValues & Document;

@Schema()
export class VariantAttributeValues extends commonDTO {

    
    @Prop({ type: String, ref: "product" })
    productId: products;

    @Prop({ required: true })
    name: string;

    @Prop()
    stock: string;

    @Prop()
    price: string;

    @Prop()
    variantSku: string;



}
export const VariantAttributeValuesSchemaFile = SchemaFactory.createForClass(VariantAttributeValues);
