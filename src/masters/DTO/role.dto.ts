import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { admin } from "src/schema/admin.schema";
import { Permission } from "src/schema/permission.schema";
import { Roles } from "src/utils/constants";

export class roleDTO {
    @IsNotEmpty()
    @IsString()
    name: string;
    
    @IsOptional()
    @IsString()
    permissionId: Permission;
  
    @IsOptional()
    @IsString()
    adminId: admin;
  
    @IsOptional()
    role: Roles;
    
    @IsOptional()
    @IsString()
    Description: string;
}
