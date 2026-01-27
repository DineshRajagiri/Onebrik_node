import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { commonDTO } from "src/common/DTO/commonDTO";
import { Document } from "mongoose";
import { Order } from "./order.schema";
import { Product } from "./products.schema";
import { productVariants } from "./productVariants.schema";

export type OrderItemDetails = OrderItem & Document;

@Schema()
export class OrderItem extends commonDTO {
  @Prop({ type: String, ref: "Order", required: true })
  orderId: string;

  @Prop({ type: String, ref: "Product", required: true })
  productId: string;

  @Prop({ type: String, ref: "productVariants" })
  variantId: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  price: number; // Price at the time of order

  @Prop({ required: true })
  totalPrice: number; // quantity * price

  @Prop()
  productName: string; // Snapshot of product name

  @Prop()
  variantName: string; // Snapshot of variant name
}

export const OrderItemSchemaFile = SchemaFactory.createForClass(OrderItem);

OrderItemSchemaFile.pre<OrderItemDetails>('save', async function (next) {
  if (this.price && this.quantity) {
    this.totalPrice = this.price * this.quantity;
  }
  next();
});

export default { name: OrderItem.name, schema: OrderItemSchemaFile };


