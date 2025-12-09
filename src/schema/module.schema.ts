// import { Group } from './group.schema';
// import { departments } from './depatments.schema';
import { v4 as uuidv4 } from 'uuid';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { commonDTO } from 'src/common/DTO/commonDTO';
export type modulesDetails = modules & Document;

@Schema()
export class modules extends commonDTO {
  @Prop({ required: true, unique: true })
  title: string;              

  @Prop()
  key: string;

  @Prop({ default: 'icon-navigation' })  
  icon: string;

  @Prop()
  url?: string;

  @Prop({ default: 1 })
  sortOrder: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const modulesSchemaFile = SchemaFactory.createForClass(modules);