import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { OtpPurpose } from './customer-send-otp.dto';

/** Verify OTP only – use for both signup (returns signupToken) and login (returns tokens). */
export class CustomerVerifyOtpDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  otp: string;

  @IsEnum(OtpPurpose)
  purpose: OtpPurpose;
}

/** Used only for OTP login – kept for backward compatibility if needed. */
export class CustomerVerifyOtpLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}
