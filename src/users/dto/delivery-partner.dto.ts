import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateDeliveryPartnerDto {
  @IsString()
  devlieryBoyName: string;

  @IsEmail()
  emailid: string;

  @MinLength(6)
  password: string;

  @IsString()
  phoneNO: string;

  address?: string;
  regionId?: string;
}
