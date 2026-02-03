import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator'
import { Roles } from 'src/utils/constants';


export class CreateUserDTO {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'This is a required property', required: true, example: 'user@21' })
  email: string;

  @ApiProperty({ type: String, description: 'This is a required property', required: true, example: 'John Doe' })
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ type: String, description: 'This is a required property', required: true, example: '1234567890' })
  @IsNotEmpty()
  mobileNumber: string;
  @ApiProperty({ type: String, description: 'This is an optional property', required: false, example: 'REF12345' })
  @MaxLength(10)
  referralCode: string;
  @ApiProperty({ type: String, description: 'This is a required property', required: true, example: 'strongPassword123' })
  @IsNotEmpty()
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

