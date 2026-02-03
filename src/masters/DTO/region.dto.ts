import { IsNotEmpty, IsOptional, IsString } from "class-validator"

export class regionDTO {
  @IsNotEmpty()
  @IsString()
  regionName: string

  @IsOptional()
  @IsString()
  discription: string

  @IsOptional()
  @IsString()
  city: string
}
