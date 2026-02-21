import { IsEmail, IsEnum } from 'class-validator';

export enum OtpPurpose {
  SIGNUP = 'signup',
  LOGIN = 'login',
}

export class CustomerSendOtpDto {
  @IsEmail()
  email: string;

  @IsEnum(OtpPurpose)
  purpose: OtpPurpose;
}
