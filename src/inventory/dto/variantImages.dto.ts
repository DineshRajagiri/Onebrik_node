import { IsNotEmpty, IsString } from "class-validator";
import { productVariants } from "src/schema/productVariants.schema";

export class VariantImagesDTO {
    @IsNotEmpty()
    @IsString()
    productVariantId: productVariants;

    @IsNotEmpty()
    @IsString()
    imageUrl: string;
}
