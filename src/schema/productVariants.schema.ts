import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { commonDTO } from "src/common/DTO/commonDTO";
import mongoose, { Document, } from "mongoose";
import { attributes } from "./attributes.schema";
import { attributesValues } from "./attributesValues.schema";
import { Product } from "./products.schema";

export type productVariantsDocument = productVariants & Document;

@Schema()
export class productVariants extends commonDTO {

    @Prop({ type: String, ref: "Product", required: true })
    productId: string;

    @Prop()
    variantName: string;

    @Prop()
    stock: string;

    @Prop()
    salePrice: number;

    @Prop()
    offerPrice: number;

    @Prop()
    variantSku: string;



}
export const productVariantsSchemaFile = SchemaFactory.createForClass(productVariants);

productVariantsSchemaFile.pre("save", async function (next) {
    if (!this.variantSku) {
        const randomCode = Math.floor(100000 + Math.random() * 900000);
        this.variantSku = `variantSku-${randomCode}`;
    }
    next();
});
