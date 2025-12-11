import { IsBoolean, IsOptional, IsString, MinLength, IsUUID } from 'class-validator';

export class UpsertRoleDto {
  
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
