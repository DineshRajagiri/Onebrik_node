import { Type } from "class-transformer";
import { IsMongoId, IsOptional, IsUUID, ValidateNested } from "class-validator";
import { PermissionItemDto } from "./create-permission.dto";

export class UpsertPermissionsForRoleDto {
  @IsUUID()
  roleId: string;

  @IsUUID()
  @IsOptional()
  userId: string

  @ValidateNested({ each: true })
  @Type(() => PermissionItemDto)
  items: PermissionItemDto[];
}
