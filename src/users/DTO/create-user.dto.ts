import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class SaveUserDto {
  @IsOptional()
  userId?: string;     // If present → update mode

  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @MinLength(6)
  password?: string;   // Not required in update, only in create

  @IsOptional()
  roleId?: string;     // May be assigned at any time
}
