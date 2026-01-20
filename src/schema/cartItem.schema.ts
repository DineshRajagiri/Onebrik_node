import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { commonDTO } from "src/common/DTO/commonDTO";
import { Document } from "mongoose";
import { Cart } from "./cart.schema";
import { Product } from "./products.schema";
import { productVariants } from "./productVariants.schema";

export type CartItemDetails = CartItem & Document;

@Schema()
export class CartItem extends commonDTO {
  @Prop({ type: String, ref: "Cart", required: true })
  cartId: string;

  @Prop({ type: String, ref: "Product", required: true })
  productId: string;

  @Prop({ type: String, ref: "productVariants" })
  variantId: string;

  @Prop({ required: true, default: 1 })
  quantity: number;

  @Prop({ required: true })
  price: number;

  @Prop()
  totalPrice: number; // quantity * price
}

export const CartItemSchemaFile = SchemaFactory.createForClass(CartItem);

CartItemSchemaFile.pre<CartItemDetails>('save', async function (next) {
  if (this.price && this.quantity) {
    this.totalPrice = this.price * this.quantity;
  }
  next();
});

export default { name: CartItem.name, schema: CartItemSchemaFile };


