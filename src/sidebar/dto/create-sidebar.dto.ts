import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SidebarDocument = Sidebar & Document;

@Schema({ timestamps: true })
export class Sidebar {

  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, enum: ['group'] })
  type: 'group';

  @Prop({ type: [Object], default: [] })
  children: any[];
}

export const SidebarSchema = SchemaFactory.createForClass(Sidebar);
