// import { Group } from './group.schema';
// import { departments } from './depatments.schema';
import { v4 as uuidv4 } from 'uuid';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { commonDTO } from 'src/common/DTO/commonDTO';
export type modulesDetails = modules & Document;

@Schema()
export class modules extends commonDTO {
  @Prop({ required: true, unique: true })
  key: string;  // NEW FIELD for permission keys (e.g., "user_management")

  @Prop()
  title: string;

  @Prop()
  type: string;

  @Prop()
  icon: string;

  @Prop({ type: Boolean, default: false })
  children: boolean;

  @Prop()
  order: number;
}

export const modulesSchemaFile = SchemaFactory.createForClass(modules);