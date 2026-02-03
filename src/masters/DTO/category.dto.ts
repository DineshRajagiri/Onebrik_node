import { IsNotEmpty, IsOptional, IsString } from "class-validator"

export class categoryDTO {
  @IsNotEmpty()
  @IsString()
  categoryName: string

  @IsOptional()
  @IsString()
  discription: string
}
