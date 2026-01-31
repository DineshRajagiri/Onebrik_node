import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, } from "mongoose";
import { inventoryCategory } from "src/schema/inventoryCategory.schema";

export class productDTO {
    @Prop({ required: true })
    productName: string;

    @Prop()
    sku: string;

    @Prop()
    price: string;

    @Prop()
    description: string;

    @Prop()
    brand: string;

    @Prop()
    about: string;

    @Prop({ default: 0 })
    rating: number;

    @Prop()
    discount: number;

    @Prop()
    offer: string;

    @Prop({ type: String, ref: "inventoryCategory", default: null })
    mainCategoryId: inventoryCategory;

    @Prop({ type: String, ref: "inventoryCategory", default: null })
    subCategoryId: inventoryCategory;

    @Prop({ type: String, ref: "inventoryCategory", default: null })
    subChildCategoryId: inventoryCategory;


}