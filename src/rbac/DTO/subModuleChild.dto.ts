import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';

export class subModuleChildDTO {
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
  @IsString()
  url?: string;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsBoolean()
  children?: boolean;

  @IsNotEmpty()
  @IsString()
  subModuleId: string;   // parent submodule

  @IsOptional()
  @IsString()
  breadcrumbs?: string;
}
