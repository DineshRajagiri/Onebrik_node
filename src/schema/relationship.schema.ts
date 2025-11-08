import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsNotEmpty } from "class-validator";
import { commonDTO } from "src/common/DTO/commonDTO";
export type relationshipDetails = relationship & Document;
@Schema()
export class relationship extends commonDTO{
  @Prop()
  relationshipTypeName: string

  @Prop()
  discription:string

}
export const relationshipSchemaFile = SchemaFactory.createForClass(relationship);

