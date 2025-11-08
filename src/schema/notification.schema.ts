import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document} from 'mongoose';
import { user } from './user.schema';
import { notificationToken } from './notificationToken.schema';
import { commonDTO } from 'src/common/DTO/commonDTO';

export type notificationDetails = notification & Document;

@Schema()
export class notification extends commonDTO {
  @Prop()
  user: string;

  @Prop()
  title: string;

  @Prop()
  body: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const notificationSchemaFile = SchemaFactory.createForClass(notification);
