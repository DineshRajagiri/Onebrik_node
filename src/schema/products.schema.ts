import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { commonDTO } from "src/common/DTO/commonDTO";
import { Document, Schema as MongooseSchema } from "mongoose";
import { inventoryCategory } from "./inventoryCategory.schema";

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product extends commonDTO {
  @Prop({ required: true })
  productName: string;

  @Prop()
  sku: string;

  @Prop()
  price: string;

  @Prop()
  description: string;

  @Prop({ type:String, ref: "inventoryCategory" })
  mainCategoryId: inventoryCategory;

  @Prop({ type:String, ref: "inventoryCategory" })
  subCategoryId: inventoryCategory;

  @Prop({ type:String, ref: "inventoryCategory" })
  subChildCategoryId: inventoryCategory;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.pre("save", async function (next) {
  if (!this.sku) {
    const randomCode = Math.floor(100000 + Math.random() * 900000);
    this.sku = `SKU-${randomCode}`;
  }
  next();
});
