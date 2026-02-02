import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength, } from 'class-validator';
export class UserDTO {

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'User email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Plain password (will be hashed internally)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  passwordHash: string;

  @ApiPropertyOptional({
    example: 9876543210,
    description: 'User mobile number',
  })
  @IsNumber()
  @IsOptional()
  mobilenumber?: number;

  @ApiProperty({
    example: '66c1f0a8c9e77a23d3b91234',
    description: 'Role ID reference',
  })
  @IsString()
  @IsNotEmpty()
  roleId: string;

  @ApiPropertyOptional({
    example: true,
    description: 'User active status',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}
