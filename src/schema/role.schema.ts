import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { commonDTO } from 'src/common/DTO/commonDTO';

export type rolesDetails = roles & Document;

@Schema({ timestamps: true })
export class roles extends commonDTO {
 @Prop({ required: true, unique: true })
  name: string;          
  @Prop()
  description?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const rolesSchemaFile = SchemaFactory.createForClass(roles);
