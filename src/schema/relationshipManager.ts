import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsNotEmpty } from "class-validator";
import { commonDTO } from "src/common/DTO/commonDTO";
export type relationshipManagerDetails = relationshipManager & Document;
@Schema()
export class relationshipManager extends commonDTO{
  @Prop()
  Name: string
  @Prop()
  MobileNumber: string
  @Prop()
  discription:string

}
export const relationshipManagerSchemaFile = SchemaFactory.createForClass(relationshipManager);