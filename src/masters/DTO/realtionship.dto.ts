import { Prop } from '@nestjs/mongoose';
import { IsNotEmpty, IsOptional } from 'class-validator';


export class relationshipDTO {
  @Prop()
  @IsNotEmpty()
  relationshipTypeName: string

  @Prop()
  discription:string

}