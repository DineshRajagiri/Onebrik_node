import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class CreateProfileDTO {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  roleId: string;

  @IsObject()
  profileData: Record<string, any>;
}
