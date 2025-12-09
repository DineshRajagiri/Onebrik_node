import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { commonDTO } from "src/common/DTO/commonDTO";
import mongoose, { Document, } from "mongoose";
import { inventoryCategory } from "./inventoryCategory.schema";

export type productDocument = products & Document;

@Schema()
export class products extends commonDTO {
    @Prop({ required: true })
    name: string;

    @Prop()
    sku: string;

    @Prop()
    price: string;

    @Prop()
    description: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "mainCategory", default: null })
    mainCategoryId: inventoryCategory;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "subCategory", default: null })
    subCategoryId: inventoryCategory;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "subCategory", default: null })
    subChildCategoryId: inventoryCategory;




}
export const productSchemaFile = SchemaFactory.createForClass(products);

productSchemaFile.pre("save", async function (next) {
    if (!this.sku) {
        const randomCode = Math.floor(100000 + Math.random() * 900000);
        this.sku = `SKU-${randomCode}`;
    }
    next();
});

module.exports = mongoose.model("Product", productSchemaFile);
