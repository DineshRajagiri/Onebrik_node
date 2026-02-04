import { IsNotEmpty, IsString } from "class-validator"

export class attributesDTO {
    @IsNotEmpty()
    @IsString()
    attributename: string;
}