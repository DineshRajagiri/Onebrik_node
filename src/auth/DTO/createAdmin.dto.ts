import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class CreateAdminDTO {
    @IsNotEmpty()
    @IsString()
    fullName: string
  
    @IsNotEmpty()
    @IsString()
    mobileNo: string
  
    @IsEmail({}, {message: "Email must be valid"})
    @IsNotEmpty()
    email: string
  
    @IsNotEmpty()
    @IsString()
    password: string
  
    @IsNotEmpty()
    @IsString()
    confirmPassword: string
}

