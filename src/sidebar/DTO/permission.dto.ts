import { Prop } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { modules } from 'src/schema/module.schema';
import { subModules } from 'src/schema/subModule.schema';
import { subModuleChild } from 'src/schema/subModuleChild.schema';


// export class permissionDTO {
//   @Prop()
//   @IsNotEmpty()
//   name: string;

//   @Prop()
//   @IsNotEmpty()
//   isAdd: boolean;

//   @Prop()
//   @IsNotEmpty()
//   isRead: boolean;

//   @Prop()
//   @IsNotEmpty()
//   isUpdate: boolean;

//   @Prop()
//   isDelete: boolean;


//   @IsNotEmpty()
//   @IsString() // ✅ Ensure it is a string
//   adminId: string;

//   @IsNotEmpty()
//   @IsString() // ✅ Ensure it is a string
//   modulesId: string;

//   @IsNotEmpty()
//   @IsString() // ✅ Ensure it is a string
//   subModuleId: string;

//   @IsOptional()
//   @IsString() // ✅ Ensure it is a string
//   subModuleChildId?: string;

//   @Prop({ type: [String], default: [] }) 
//   permissions: string[];
// }

export class AssignPermissionsDto {
  @IsString()
  adminId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionDto)
  permissions: PermissionDto[];
}

export class PermissionDto {
  @IsString()
  modulesId: string;

  @IsString()
  subModuleId?: string;

  @IsString()
  subModuleChildId?: string;

  @IsBoolean()
  isAdd: boolean;

  @IsBoolean()
  isEdit: boolean;

  @IsBoolean()
  isDelete: boolean;

  @IsBoolean()
  isRead: boolean;
}

