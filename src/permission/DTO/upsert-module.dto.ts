import { IsBoolean, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class UpsertModuleDto {

  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @MinLength(2)
  title: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
