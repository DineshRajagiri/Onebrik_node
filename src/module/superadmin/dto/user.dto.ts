import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength, } from 'class-validator';

export class UserDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  passwordHash: string;

  @IsNumber()
  @IsOptional()
  mobilenumber?: number;

  @IsString()
  @IsNotEmpty()
  roleId: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}
