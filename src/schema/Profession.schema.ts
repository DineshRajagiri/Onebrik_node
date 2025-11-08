import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { IsNotEmpty } from "class-validator";
import { commonDTO } from "src/common/DTO/commonDTO";

export type professionDetails = profession & Document;
@Schema()
export class profession extends commonDTO{
  @Prop()
  professionTypeName: string

  @Prop()
  discription:string

}
export const professionSchemaFile = SchemaFactory.createForClass(profession);