import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class notification_token_Dto {
  @IsNotEmpty()
  @IsString()
  userId: string;
  
  @IsNotEmpty()
  @IsString()
  notification_token: string;
  
  @IsOptional()
  @IsString()
  deviceType: string;
}