import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsString, ValidateNested } from "class-validator";

export class VariantAttributeItem {
  @IsString()
  @IsNotEmpty()
  attributeId: string;

  @IsString()
  @IsNotEmpty()
  attributeValuesId: string;
}

export class VariantAttributeValuesDTO {
  @IsString()
  @IsNotEmpty()
  productVariantId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantAttributeItem)
  attributes: VariantAttributeItem[];
}


