import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { commonDTO } from 'src/common/DTO/commonDTO';
export type UserProfileDocument = UserProfile & Document;
@Schema({ timestamps: true })
export class UserProfile extends commonDTO  {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  roleId: string;

  @Prop({ type: Object, default: {} })
  profileData: Record<string, any>;  
}

export const UserProfileSchema = SchemaFactory.createForClass(UserProfile);

