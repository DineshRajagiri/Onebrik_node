import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CustomerPasswordLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;
}
