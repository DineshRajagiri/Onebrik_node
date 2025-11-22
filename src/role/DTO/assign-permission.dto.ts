import { IsString, IsArray } from 'class-validator';

export class AssignPermissionDTO {
  @IsString()
  roleId: string;

  @IsArray()
  permissions: {
    moduleId: string;
    subModuleId: string;
    childId: string;
  }[];
}
