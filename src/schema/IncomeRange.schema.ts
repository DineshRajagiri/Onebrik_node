import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsNotEmpty } from "class-validator";
import { commonDTO } from "src/common/DTO/commonDTO";
export type incomeRangeDetails = incomeRange & Document;
@Schema()
export class incomeRange extends commonDTO{
  @Prop()
  incomeRangeTypeName: string

  @Prop()
  discription:string

}
export const incomeRangeSchemaFile = SchemaFactory.createForClass(incomeRange);

