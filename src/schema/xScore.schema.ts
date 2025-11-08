import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { commonDTO } from "src/common/DTO/commonDTO";
export type xScoreDetails = xScore & Document;

@Schema()
export class xScore extends commonDTO {
    @Prop()
    xScoreName: string;

    @Prop()
    xScoreValue: string;
}

export const xScoreSchemaFile = SchemaFactory.createForClass(xScore);
