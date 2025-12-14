import { Prop } from "@nestjs/mongoose"
import { IsNotEmpty } from "class-validator"

export class attributesDTO {
    @Prop()
    @IsNotEmpty()
    attributename: string;

}