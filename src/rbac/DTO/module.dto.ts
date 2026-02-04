import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class moduleDTO {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  icon: string;

  @IsOptional()
  @IsBoolean()
  children?: boolean;

  @IsOptional()
  @IsNumber()
  order?: number;
}