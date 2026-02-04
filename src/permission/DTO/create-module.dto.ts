import { IsBoolean, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAppModuleDto {
  @IsString()
  @MinLength(2)
  title: string;
  
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
