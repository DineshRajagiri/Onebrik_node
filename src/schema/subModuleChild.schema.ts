import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types} from 'mongoose';
import { commonDTO } from 'src/common/DTO/commonDTO';
import { subModules } from './subModule.schema';

export type subModuleChildDetails = subModuleChild & Document;

@Schema()
export class subModuleChild extends commonDTO {
   @Prop({ type: Types.ObjectId, ref: 'SubModule', required: true })
  subModuleId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true })
  key: string;

  @Prop()
  url?: string;

  @Prop({ default: 1 })
  sortOrder: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const subModuleChildSchemaFile = SchemaFactory.createForClass(subModuleChild);
