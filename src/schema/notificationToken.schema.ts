import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from './user.schema';
import { commonDTO } from 'src/common/DTO/commonDTO';

export type notificationTokenDetails = notificationToken & Document;

@Schema()
export class notificationToken extends commonDTO {
  @Prop()  
  user: string
  @Prop()
  notification_token: string;

  @Prop()
  deviceType: string;
}

export const notificationTokenSchemaFile = SchemaFactory.createForClass(notificationToken);
