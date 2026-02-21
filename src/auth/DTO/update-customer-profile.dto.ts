import { IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class UpdateCustomerProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  /** Pick a Ghibli avatar by id (see GET /auth/customer/avatars). */
  @IsOptional()
  @IsString()
  avatarId?: string;

  /** Or set a custom avatar/personality image URL. */
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}
