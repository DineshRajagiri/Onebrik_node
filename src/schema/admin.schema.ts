import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty, IsString } from 'class-validator';
import { Document, SchemaTypes, Types } from 'mongoose';
import { commonDTO } from 'src/common/DTO/commonDTO';
import { Roles, isAdminStatus, isUserStatus } from 'src/utils/constants';
export type adminDetails = admin & Document;

// @Schema()
@Schema({ timestamps: true })
export class admin extends commonDTO {

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  role: string; // SUPERADMIN / ADMIN

  @Prop({ default: isAdminStatus.ACTIVE })
  adminStatus: string;

  @Prop()
  department?: string;

  @Prop()
  level?: number;

  @Prop()
  adminProfile?: string;

  @Prop()
  refreshToken?: string;
}

export const adminSchemaFile = SchemaFactory.createForClass(admin);


