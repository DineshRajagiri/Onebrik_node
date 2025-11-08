import { Prop } from '@nestjs/mongoose';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { modules } from 'src/schema/module.schema';


export class subModuleDTO {
  @Prop()
  @IsNotEmpty()
  title: string

  @Prop()
  type:string

  @Prop()
  @IsNotEmpty()
  icon:string

  @Prop()
  children:boolean

  @Prop()
  @IsNotEmpty()
  @IsNumber()
  order: number;
  @Prop()
  url: string
  
  @Prop({ type: String, ref:"modules"})
  modulesId: modules;


  @Prop()
  breadcrumbs:string;
}
