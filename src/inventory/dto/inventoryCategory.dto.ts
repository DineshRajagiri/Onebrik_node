import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, } from "mongoose";
import { inventoryCategory } from "src/schema/inventoryCategory.schema";

export class inventoryCategoryDTO {
    @Prop({ required: true })
    categoryName: string;

    @Prop({ type: String, ref: "inventoryCategory", default: null })
    parentId: inventoryCategory;

    @Prop({ type: String, enum: ["MAIN", "SUB", "SUBCHILD"], required: true })
    level: string;

}