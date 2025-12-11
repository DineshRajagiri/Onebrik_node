import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { productVariants } from "src/schema/productVariants.schema";

export class VariantImagesDTO {

    @Prop({ type: String, ref: "productVariant" ,required: true})
    productVariantId: productVariants;

    @Prop({ required: true })
    imageUrl: string;
}
