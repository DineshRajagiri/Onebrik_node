import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty, IsString } from 'class-validator';
import { Document, SchemaTypes, Types } from 'mongoose';
import { commonDTO } from 'src/common/DTO/commonDTO';
import { Roles, isAdminStatus, isUserStatus } from 'src/utils/constants';
export type adminDetails = admin & Document;

@Schema()
export class admin extends commonDTO {
  @Prop({ required: true })
  userId: string;

  @Prop()
  department?: string;

  @Prop()
  level?: number;

  @Prop()
  adminProfile?: string; 

  @Prop({ default: isAdminStatus.ACTIVE })
  adminStatus: string;
}
export const adminSchemaFile = SchemaFactory.createForClass(admin);


