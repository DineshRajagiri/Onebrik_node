import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { commonDTO } from 'src/common/DTO/commonDTO';

export type UserDocument = User & Document;

@Schema()
export class User extends commonDTO {

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  password: string;  

  @Prop({ type: String, default: null })
  roleId: string;    

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
