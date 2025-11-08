import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator'
import { Roles } from 'src/utils/constants';


export class CreateUserDTO {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'This is a required property', required: true, example: 'user@21' })
  email: string;

  @IsNotEmpty()
  fullName: string;

  @IsNotEmpty()
  mobileNumber: string;
  referralCode: string;
  passwordHash: string;
  accountStatus: boolean;
  customerCode: string;
  isVerifiedByAdmin: boolean;
  istermAndPolicy: boolean;
  role: Roles;



  constructor() {
    this.role = Roles.USER;
  }
}

