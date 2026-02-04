import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';

export class subModuleDTO {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  icon: string;

  @IsOptional()
  @IsBoolean()
  children?: boolean;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsString()
  url?: string;

  @IsNotEmpty()
  @IsString()
  moduleId: string;   

  @IsOptional()
  @IsString()
  breadcrumbs?: string;
}
