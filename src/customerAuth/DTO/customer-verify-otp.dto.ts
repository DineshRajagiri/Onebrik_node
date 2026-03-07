import { IsEmail, IsString, Length } from 'class-validator';

export class CustomerVerifyOtpDto {

  @IsEmail()
  email: string;

  @IsString()
  @Length(6,6)
  otp: string;

}