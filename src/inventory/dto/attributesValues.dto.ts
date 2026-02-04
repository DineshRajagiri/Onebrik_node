import { IsNotEmpty, IsString } from "class-validator"
import { attributes } from "src/schema/attributes.schema";

export class attributesValuesDTO {
    @IsNotEmpty()
    @IsString()
    value: string;
    
    @IsString()
    @IsNotEmpty()
    attributeId: attributes;
}