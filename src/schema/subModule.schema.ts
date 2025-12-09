import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types} from 'mongoose';
import { commonDTO } from 'src/common/DTO/commonDTO';
import { modules } from './module.schema';

export type subModulesDetails = subModules & Document;

@Schema({ timestamps: true })
export class subModules extends commonDTO {
   @Prop({ type: Types.ObjectId, ref: 'AppModule', required: true })
  moduleId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true })
  key: string;

  @Prop()
  icon?: string;

  @Prop()
  url?: string;

  @Prop({ default: 1 })
  sortOrder: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const subModulesSchemaFile = SchemaFactory.createForClass(subModules);


