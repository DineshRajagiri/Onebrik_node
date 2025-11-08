import { Prop } from '@nestjs/mongoose';
import { IsNotEmpty, IsOptional } from 'class-validator';


export class relationshipManagerDTO {
  @Prop()
  @IsNotEmpty()
  Name: string
     
  @Prop()
  MobileNumber: string
  @Prop()
  discription:string

}