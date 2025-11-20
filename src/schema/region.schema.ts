import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { IsNotEmpty } from "class-validator";
import { commonDTO } from "src/common/DTO/commonDTO";

export type regionDetails = region & Document;
@Schema()
export class region extends commonDTO{
  @Prop()
  regionName: string

  @Prop()
  discription:string

  @Prop()
  city:string
}
export const regionSchemaFile = SchemaFactory.createForClass(region);