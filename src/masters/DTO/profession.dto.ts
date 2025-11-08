import { Prop } from '@nestjs/mongoose';
import { IsNotEmpty, IsOptional } from 'class-validator';


export class professionDTO {
  @Prop()
  @IsNotEmpty()
  professionTypeName: string

  @Prop()
  discription:string

}