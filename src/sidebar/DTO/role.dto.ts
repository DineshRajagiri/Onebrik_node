import { Prop } from '@nestjs/mongoose';
import { IsNotEmpty } from 'class-validator';
import { permission } from 'src/schema/permission.schema';
import { Roles } from 'src/utils/constants';

export class roleDTO {
  @Prop()
  @IsNotEmpty()
  name: string

  @Prop()
  @IsNotEmpty()
  @Prop({ type: String, ref: "permission" })
  permissionId: permission;

  @Prop()
  @IsNotEmpty()
  adminId: string;

  @Prop({ type: String, enum: Roles })
  role: Roles;
}