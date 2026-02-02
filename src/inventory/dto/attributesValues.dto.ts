import { Prop } from "@nestjs/mongoose"
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator"
import { attributes } from "src/schema/attributes.schema";

export class attributesValuesDTO {
    @ApiProperty({ type: String, description: 'This is a required property', required: true, example: 'Large' })
    @Prop({ required: true })
    @IsNotEmpty()
    value: string;
    @ApiProperty({ type: String, description: 'This is a required property', required: true, example: '64f7c2e8b4d1c2a1b2c3d4e5' })
    @Prop({ type: String, ref: "attributes" })
    attributeId: attributes;

}