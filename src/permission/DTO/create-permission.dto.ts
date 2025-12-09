import { IsBoolean, IsMongoId, IsOptional } from 'class-validator';

export class CreatePermissionDto {
  @IsMongoId()
  roleId: string;

  @IsMongoId()
  moduleId: string;

  @IsOptional()
  @IsMongoId()
  subModuleId?: string;

  @IsOptional()
  @IsMongoId()
  subModuleChildId?: string;

  @IsOptional()
  @IsBoolean()
  canView?: boolean;

  @IsOptional()
  @IsBoolean()
  canCreate?: boolean;

  @IsOptional()
  @IsBoolean()
  canUpdate?: boolean;

  @IsOptional()
  @IsBoolean()
  canDelete?: boolean;
}
