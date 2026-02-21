import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { commonDTO } from 'src/common/DTO/commonDTO';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User extends commonDTO {

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  roleId: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ unique: true, sparse: true })
  userid: string;

  /** Profile avatar / personality image URL (e.g. Ghibli-style photo). */
  @Prop()
  avatarUrl?: string;

  @Prop()
  refreshToken?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
