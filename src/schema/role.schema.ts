import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { permission } from './permission.schema';
import { commonDTO } from 'src/common/DTO/commonDTO';
import { admin } from './admin.schema';
import { Roles } from 'src/utils/constants';
export type rolesDetails = roles & Document;

@Schema()
export class roles extends commonDTO {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ type: [String], default: [] })
  permissions: string[];
}

export const rolesSchemaFile = SchemaFactory.createForClass(roles);
