import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document} from 'mongoose';
import { commonDTO } from 'src/common/DTO/commonDTO';
import { modules } from './module.schema';

export type subModulesDetails = subModules & Document;

@Schema()
export class subModules extends commonDTO {
  @Prop()
  title: string;
  @Prop()
  type: string;
  @Prop()
  icon: string;
  @Prop({type:Boolean,default:false})
  children: boolean;
  @Prop()
  order: number;
  @Prop()
  url: string;
  @Prop({ type: String, ref:"modules"})
  modulesId: modules;
  @Prop()
  breadcrumbs:string;
}

export const subModulesSchemaFile = SchemaFactory.createForClass(subModules);


