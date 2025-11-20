import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { IsNotEmpty } from "class-validator";
import { commonDTO } from "src/common/DTO/commonDTO";

export type categoryDetails = category & Document;
@Schema()
export class category extends commonDTO{
  @Prop()
  categoryName: string

  @Prop()
  discription:string

}
export const categorySchemaFile = SchemaFactory.createForClass(category);