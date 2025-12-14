import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { commonDTO } from "src/common/DTO/commonDTO";
import {  Document,  } from "mongoose";

export type AttributesDocument = attributes & Document;

@Schema()
export class attributes extends commonDTO {
 @Prop()
  attributename: string;


}
export const attributesSchemaFile = SchemaFactory.createForClass(attributes);