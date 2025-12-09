import { Prop } from '@nestjs/mongoose';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';


export class moduleDTO {
  
  @Prop()
  @IsNotEmpty()
  @IsString()
  title: string;

  @Prop()
  @IsNotEmpty()
  @IsString()
  type: string;

  @Prop()
  @IsNotEmpty()
  @IsString()
  icon: string;

  @Prop()
  @IsOptional()
  @IsBoolean()
  children?: boolean;

  @Prop()
  @IsOptional()
  @IsNumber()
  order?: number;
}