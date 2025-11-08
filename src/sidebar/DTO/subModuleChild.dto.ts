import { Prop } from '@nestjs/mongoose';
import { isNotEmpty, IsNotEmpty } from 'class-validator';
import { modules } from 'src/schema/module.schema';
import { subModules } from 'src/schema/subModule.schema';


export class subModuleChildDTO {
  @Prop()
  @IsNotEmpty()
  title: string

  @Prop()

  type:string

  @Prop()

  icon:string

  @Prop()

  children:boolean

  @Prop()       
  order: string

  @Prop()
  url: string
  
  @Prop({ type: String, ref:"subModules"})
  @IsNotEmpty()
  subModuleId: subModules;
  @Prop()
  breadcrumbs:string
}