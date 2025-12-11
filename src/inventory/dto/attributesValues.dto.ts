import { Prop } from "@nestjs/mongoose"
import { IsNotEmpty } from "class-validator"
import { attributes } from "src/schema/attributes.schema";

export class attributesValuesDTO {
    @Prop({ required: true })
    @IsNotEmpty()
    value: string;

    @Prop({ type: String, ref: "attributes" })
    attributeId: attributes;

}