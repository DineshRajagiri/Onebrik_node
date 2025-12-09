import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { commonDTO } from "src/common/DTO/commonDTO";
import { Document, } from "mongoose";
import { attributes } from "./attributes.schema";

export type AttributesValuesDocument = attributesValues & Document;

@Schema()
export class attributesValues extends commonDTO {

    @Prop({ required: true })
    value: string;

    @Prop({ type: String, ref: "attributes" })
    attributeId: attributes;
}
export const attributesValuesSchemaFile = SchemaFactory.createForClass(attributesValues);