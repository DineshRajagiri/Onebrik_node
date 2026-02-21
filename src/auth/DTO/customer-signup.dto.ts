import { IsNotEmpty, IsString, MinLength } from 'class-validator';

/** Complete signup after OTP verified – send signupToken from verify-otp, plus name and password. */
export class CustomerSignupDto {
  @IsString()
  @IsNotEmpty({ message: 'Signup token is required (from verify-otp step)' })
  signupToken: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;
}
