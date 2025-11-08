import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsNotEmpty } from "class-validator";
import { commonDTO } from "src/common/DTO/commonDTO";

export type experienceDetails = experience & Document;
@Schema()
export class experience extends commonDTO{
  @Prop()
  experienceTypeName: string

  @Prop()
  discription:string

}
export const experienceSchemaFile = SchemaFactory.createForClass(experience);