import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { commonDTO } from "src/common/DTO/commonDTO";
import mongoose, { Document, } from "mongoose";

export type inventoryCategoryDocument = inventoryCategory & Document;

@Schema()
export class inventoryCategory extends commonDTO {
    @Prop({ required: true })
    categoryName: string;

    @Prop({ type: String, ref: "inventoryCategory", default: null })
    parentId: inventoryCategory;

    @Prop({ type: String, enum: ["MAIN", "SUB", "SUBCHILD"], required: true })
    level: string;


    @Prop({ required: true })
    imageUrl: string;

}
export const inventoryCategorySchemaFile = SchemaFactory.createForClass(inventoryCategory);