import { Prop } from '@nestjs/mongoose';
import { IsNotEmpty, IsString } from 'class-validator';

export class notification_token_Dto {
  @IsNotEmpty()
  userId: string;
  @IsNotEmpty()
  notification_token: string;
  @Prop()
  deviceType: string;
}