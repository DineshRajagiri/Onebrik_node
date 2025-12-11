import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, } from "mongoose";
import { inventoryCategory } from "src/schema/inventoryCategory.schema";
import { Product } from "src/schema/products.schema";

export class productVariantsDTO {
    @Prop()
    productId: string;

    @Prop()
    variantName: string;

    @Prop()
    stock: string;

    @Prop()
    price: string;

    @Prop()
    variantSku: string;

}
