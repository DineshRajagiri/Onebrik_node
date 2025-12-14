import { Type } from "class-transformer";
import { IsMongoId, IsUUID, ValidateNested } from "class-validator";
import { PermissionItemDto } from "./create-permission.dto";

export class UpsertPermissionsForRoleDto {
   @IsUUID()
  roleId: string;

  @ValidateNested({ each: true })
  @Type(() => PermissionItemDto)
  items: PermissionItemDto[];
}
