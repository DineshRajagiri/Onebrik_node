import { Prop } from '@nestjs/mongoose';
import { IsNotEmpty, IsOptional } from 'class-validator';


export class experienceDTO {
  @Prop()
  @IsNotEmpty()
  experienceTypeName: string

  @Prop()
  discription:string
}