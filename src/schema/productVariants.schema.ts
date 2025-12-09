import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { commonDTO } from "src/common/DTO/commonDTO";
import mongoose, { Document, } from "mongoose";
import { inventoryCategory } from "./inventoryCategory.schema";
import { products } from "./products.schema";
import { attributes } from "./attributes.schema";
import { attributesValues } from "./attributesValues.schema";

export type productVariantsDocument = productVariants & Document;

@Schema()
export class productVariants extends commonDTO {


    @Prop({ type: String, ref: "productVariants" })
    variantId: productVariants;

    @Prop({ type: String, ref: "attributes" })
    attributeId: attributes;


    @Prop({ type: String, ref: "attributesValues" })
    attributeValuesId: attributesValues;

    @Prop()
    stock: string;

    @Prop()
    price: string;

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

module.exports = mongoose.model("productVariants", productVariantsSchemaFile);