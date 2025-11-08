import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { commonDTO } from "src/common/DTO/commonDTO";
import { Connection, Document, Model } from "mongoose";

export type BlogsDocument = blogs & Document;

@Schema()
export class blogs extends commonDTO {
 @Prop()
  blogHeading: string;

  @Prop()
  description: string;

  @Prop()
  date: string;

  @Prop()
  image: string;
}
export const blogsSchemaFile = SchemaFactory.createForClass(blogs);