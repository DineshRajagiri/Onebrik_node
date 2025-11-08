import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator'
import { Roles } from 'src/utils/constants';


export class CreateAdminDTO {
    @Prop()
    @IsNotEmpty()
    fullName:string
  
    @Prop()
    @IsNotEmpty()
    mobileNo:string
  
    @Prop()
    @IsEmail( {},{message:"Email must be valid"})
    @IsNotEmpty()
    email:string
  
    @Prop()
    @IsNotEmpty()
    password:string
  
    @Prop()
    @IsNotEmpty()
    confirmPassword:string
    
}

