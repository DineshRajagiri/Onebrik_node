import { IsBoolean, IsNumber, IsOptional, IsString, MinLength, IsUUID } from 'class-validator';

export class UpsertSubModuleDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsUUID()
  moduleId: string;

  @IsString()
  @MinLength(2)
  title: string;

  @IsOptional()
  @IsString()
  icon?: string;    

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
