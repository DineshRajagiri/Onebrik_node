import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { commonDTO } from "src/common/DTO/commonDTO";
import mongoose, { Document, } from "mongoose";
import { inventoryCategory } from "./inventoryCategory.schema";
import { products } from "./products.schema";
import { productVariants } from "./productVariants.schema";

export type VariantImagesDocument = VariantImages & Document;

@Schema()
export class VariantImages extends commonDTO {

    
    @Prop({ type: String, ref: "productVariant" })
    productVariantId: productVariants;

    @Prop({ required: true })
    imageUrl: string;

}
export const VariantImagesSchemaFile = SchemaFactory.createForClass(VariantImages);
