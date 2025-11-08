import { Prop } from '@nestjs/mongoose';
import { IsNotEmpty, IsOptional } from 'class-validator';


export class incomeRangeDTO {
  @Prop()
  @IsNotEmpty()
  incomeRangeTypeName: string

  @Prop()
  discription:string

}