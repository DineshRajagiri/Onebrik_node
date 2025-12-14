import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAdminDto {
     name: string;
  email: string;
  password: string;

//   @IsMongoId()
  roleId: string;

  isActive?: boolean;
  department?: string;
  level?: number;
}
