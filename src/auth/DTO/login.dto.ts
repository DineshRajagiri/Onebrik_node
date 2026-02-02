import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ type: String, description: 'This is a required property', required: true, example: 'user@21' })
  @IsEmail()
  email: string;

  @ApiProperty({ type: String, description: 'This is a required property', required: true, example: 'strongPassword123' })
  @IsNotEmpty()
  password: string;
}
