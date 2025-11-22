import { Prop } from '@nestjs/mongoose';
import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';

export class subModuleDTO {
  
  @Prop()
  @IsNotEmpty()
  @IsString()
  key: string;   // required: "users"

  @Prop()
  @IsNotEmpty()
  @IsString()
  title: string;

  @Prop()
  @IsOptional()
  @IsString()
  type: string;

  @Prop()
  @IsOptional()
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

  @Prop()
  @IsOptional()
  @IsString()
  url?: string;

  @Prop()
  @IsNotEmpty()
  @IsString()
  moduleId: string;   // parent module

  @Prop()
  @IsOptional()
  @IsString()
  breadcrumbs?: string;
}
