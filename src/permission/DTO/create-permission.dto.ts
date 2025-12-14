import {
  IsBoolean,
  IsOptional,
  IsUUID,
  ValidateIf
} from 'class-validator';

export class PermissionItemDto {
  level: 'module' | 'subModule' | 'child';
  id: string;
  moduleId: string;
  subModuleChildId: string;
  subModuleId: string;
  canView: boolean;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export class UpsertPermissionsForRoleDto {
  roleId: string;
  items: PermissionItemDto[];
}