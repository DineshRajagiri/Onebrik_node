import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { commonDTO } from "src/common/DTO/commonDTO";
import mongoose, { Document, } from "mongoose";

export type inventoryCategoryDocument = inventoryCategory & Document;

@Schema()
export class inventoryCategory extends commonDTO {
    @Prop({ required: true })
    name: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null })
    parentId: inventoryCategory;

    @Prop({ type: String, enum: ["MAIN", "SUB", "SUB_CHILD"], required: true })
    level: string;


}
export const inventoryCategorySchemaFile = SchemaFactory.createForClass(inventoryCategory);