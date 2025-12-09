import { Prop } from '@nestjs/mongoose';
import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';

export class subModuleChildDTO {
  


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
  @IsString()
  url?: string;

  @Prop()
  @IsOptional()
  @IsNumber()
  order?: number;

  @Prop()
  @IsOptional()
  @IsBoolean()
  children?: boolean;

  @Prop()
  @IsNotEmpty()
  @IsString()
  subModuleId: string;   // parent submodule

  @Prop()
  @IsOptional()
  @IsString()
  breadcrumbs?: string;
}
