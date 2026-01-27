import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubCursorDocument = SubCursor & Document;

@Schema({ timestamps: true })
export class SubCursor {
  
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  subId: string; // parent cursor / course id

  @Prop({ type: Number, default: 0 })
  order: number;

  @Prop()
  image: string; // image URL or file path
}

export const SubCursorSchema = SchemaFactory.createForClass(SubCursor);
