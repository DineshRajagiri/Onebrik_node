
import { IsBoolean, IsOptional, IsUUID, IsIn } from 'class-validator';

export class PermissionItemDto {

  // @IsIn(['module', 'subModule', 'child'])
  // level: 'module' | 'subModule' | 'child';

  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsUUID()
  moduleId?: string;

  @IsOptional()
  @IsUUID()
  subModuleId?: string;

  @IsOptional()
  @IsUUID()
  subModuleChildId?: string;

  @IsBoolean()
  canView: boolean;

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
// export class UpsertPermissionsForRoleDto {
//   roleId: string;
//   items: PermissionItemDto[];
// }