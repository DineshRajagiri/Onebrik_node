import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import mongoose, { Document, } from "mongoose";
import { inventoryCategory } from "src/schema/inventoryCategory.schema";


export class inventoryCategoryDTO {
    @ApiProperty({ type: String, description: 'This is a required property', required: true, example: 'Electronics' })
    @Prop({ required: true })
    categoryName: string;
    @ApiProperty({ type: String, description: 'This is a required property', required: true, example: '64f7c2e8b4d1c2a1b2c3d4e5' })
    @Prop({ type: String, ref: "inventoryCategory", default: null })
    parentId: inventoryCategory;
    @ApiProperty({ type: String, description: 'This is a required property', required: true, example: 'MAIN or SUB or SUBCHILD' })
    @Prop({ type: String, enum: ["MAIN", "SUB", "SUBCHILD"], required: true })
    level: string;

}