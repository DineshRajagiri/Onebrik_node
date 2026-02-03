import { Prop } from "@nestjs/mongoose"
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator"

export class attributesDTO {
    @ApiProperty({ type: String, description: 'This is a required property', required: true, example: 'Size' })
    @Prop()
    @IsNotEmpty()
    attributename: string;

}