import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateDeviceDto {
  @IsNotEmpty()
  @IsString()
  deviceToken: string;

  @IsNotEmpty()
  @IsString()
  deviceType: string; // 'ios' | 'android' | 'web'

  @IsOptional()
  @IsString()
  osVersion?: string;

  @IsOptional()
  @IsString()
  appVersion?: string;

  @IsOptional()
  @IsString()
  fcmToken?: string;
}


