import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator'
import { Roles } from 'src/utils/constants';

export class CreateUserDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  fullName: string;

  @IsNotEmpty()
  mobileNumber: string;

  @MaxLength(10)
  referralCode: string;

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

