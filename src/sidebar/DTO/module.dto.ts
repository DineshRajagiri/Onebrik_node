import { Prop } from '@nestjs/mongoose';
import { IsNotEmpty, IsOptional } from 'class-validator';


export class moduleDTO {
  @Prop()
  @IsNotEmpty()
  title: string

  @Prop()
  @IsNotEmpty()
  type:string

  @Prop()
  @IsNotEmpty()
  icon:string

  @Prop()
  @IsOptional()
  children: boolean

  @Prop()
  @IsOptional()
  order: number
}