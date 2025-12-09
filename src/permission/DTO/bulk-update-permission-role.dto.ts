import { Type } from "class-transformer";
import { IsMongoId, ValidateNested } from "class-validator";
import { CreatePermissionDto } from "./create-permission.dto";

export class UpsertPermissionsForRoleDto {
  @IsMongoId()
  roleId: string;

  @ValidateNested({ each: true })
  @Type(() => CreatePermissionDto)
  items: CreatePermissionDto[];
}
