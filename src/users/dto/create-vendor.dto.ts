import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateVendorDto {
  @IsString()
  vendorName: string;

  @IsEmail()
  emailID: string;

  @MinLength(6)
  password: string;

  @IsString()
  mobileNumber: string;

  @IsString()
  gstNumber: string;

  address1?: string;
  country?: string;
  state?: string;
  city?: string;
}
