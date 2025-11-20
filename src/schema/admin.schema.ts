import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty, IsString } from 'class-validator';
import { Document, SchemaTypes, Types } from 'mongoose';
import { commonDTO } from 'src/common/DTO/commonDTO';
import { Roles, isAdminStatus, isUserStatus } from 'src/utils/constants';
export type adminDetails = admin & Document;

@Schema()
export class admin extends commonDTO {
  @Prop()
  email: string;

  @Prop()
  fullName: string;

  @Prop()
  mobileNo: string;

  @Prop({ type: String, enum: Roles })
  role: Roles;


  @Prop({ default: null })
  passwordHash: string;

  @Prop()
  salt: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop()
  passwordExpDate: string;

  @Prop()
  resetPasswordExpires: Date;

  @Prop()
  resetPasswordToken: string;

  @Prop()
  refreshToken: string;

  @Prop()
  adminProfile: string;
  @Prop({ type: String, enum: isAdminStatus, default: isAdminStatus.ACTIVE })
  adminStatus: isAdminStatus;
@Prop()
oldPassword:string;
@Prop()
newPassword:string;
}
export const adminSchemaFile = SchemaFactory.createForClass(admin);


