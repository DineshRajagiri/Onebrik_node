import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export class FullVariantDTO {

    @Prop({ required: true })
    variantName: string;

    @Prop()
    price: string;

    @Prop()
    stock: string;

    @Prop()
    variantSku?: string;

    @Prop()
    attributes: { attributeId: string; attributeValuesId: string; }[];

    @Prop()
    images: string[];
}

export class CreateFullProductDTO {

    @Prop({ required: true })
    productName: string;

    @Prop()
    description?: string;

    @Prop()
    price?: string;

    @Prop()
    sku?: string;

    @Prop()
    mainCategoryId?: string;

    @Prop()
    subCategoryId?: string;

    @Prop()
    subChildCategoryId?: string;

    @Prop()
    variants: FullVariantDTO[];
}
