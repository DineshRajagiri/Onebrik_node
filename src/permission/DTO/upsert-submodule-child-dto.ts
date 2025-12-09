import { IsBoolean, IsNumber, IsOptional, IsString, MinLength, IsUUID } from 'class-validator';

export class UpsertSubModuleChildDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsUUID()
  subModuleId: string;

  @IsString()
  @MinLength(2)
  title: string;

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
