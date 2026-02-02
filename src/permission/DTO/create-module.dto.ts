import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAppModuleDto {
  @ApiProperty({ type: String, description: 'Title of the module', required: true, example: 'User Management' })
  @IsString()
  @MinLength(2)
  title: string;
  @ApiProperty({ type: Number, description: 'Sort order of the module', required: false, example: 1 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
