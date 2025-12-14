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

    @Prop({ type:String, ref: "inventoryCategory", default: null })
    mainCategoryId: inventoryCategory;

    @Prop({ type:String, ref: "inventoryCategory", default: null })
    subCategoryId: inventoryCategory;

    @Prop({ type:String, ref: "inventoryCategory", default: null })
    subChildCategoryId: inventoryCategory;
    

}