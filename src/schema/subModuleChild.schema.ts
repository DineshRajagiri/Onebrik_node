import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document} from 'mongoose';
import { commonDTO } from 'src/common/DTO/commonDTO';
import { subModules } from './subModule.schema';

export type subModuleChildDetails = subModuleChild & Document;

@Schema()
export class subModuleChild extends commonDTO {
  @Prop()
  title: string;
  @Prop()
  type: string;
  @Prop()
  icon: string;
  @Prop()
  url: string;
  @Prop()
  order: string;
  @Prop({type:Boolean,default:false})
  children: boolean;
  @Prop({ type: String, ref:"subModules"})
  subModuleId: subModules;
  @Prop()
  breadcrumbs:string;
}

export const subModuleChildSchemaFile = SchemaFactory.createForClass(subModuleChild);
