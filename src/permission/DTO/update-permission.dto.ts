import { PartialType } from '@nestjs/mapped-types';
import { PermissionItemDto } from './create-permission.dto';
// import { CreatePermissionDto } from './create-permission.dto';


export class UpdatePermissionDto extends PartialType(PermissionItemDto) {}
