import { Prop } from "@nestjs/mongoose";
import { IsNotEmpty } from "class-validator";
import { admin } from "src/schema/admin.schema";
import { permission } from "src/schema/permission.schema";
import { Roles } from "src/utils/constants";

export class roleDTO {
    @Prop()
    @IsNotEmpty()
    name: string;
    @Prop()
    permissionId: permission;
  
    @Prop()
    adminId: admin;
  
    @Prop()
      role: Roles;
    @Prop()
      Description:string;
}
