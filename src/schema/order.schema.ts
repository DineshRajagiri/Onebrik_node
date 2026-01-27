import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { commonDTO } from "src/common/DTO/commonDTO";
import { Document, Connection } from "mongoose";
import { CounterDocument } from "./counter.schema";
import { Customer } from "./customer.schema";
import { CustomerAddress } from "./customerAddress.schema";

export type OrderDetails = Order & Document;

@Schema()
export class Order extends commonDTO {
  @Prop()
  orderId: string;

  @Prop({ type: String, ref: "Customer", required: true })
  customerId: string;

  @Prop({ type: String, ref: "CustomerAddress", required: true })
  addressId: string;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ default: 0 })
  discountAmount: number;

  @Prop({ required: true })
  finalAmount: number;

  @Prop({ default: 'pending' })
  orderStatus: string; // 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

  @Prop()
  orderDate: Date;

  @Prop()
  deliveryDate: Date;

  @Prop()
  notes: string;

  @Prop()
  shippingCharges: number;
}

export const OrderSchemaFile = SchemaFactory.createForClass(Order);

OrderSchemaFile.pre<OrderDetails>('save', async function (next) {
  if (!this.orderId) {
    const connection: Connection = this.collection.conn;
    const counterModel = connection.model<CounterDocument>('Counter');

    const counter = await counterModel.findOneAndUpdate(
      { field: 'orderId' },
      { $inc: { sequenceValue: 1 } },
      { new: true, upsert: true }
    );
    this.orderId = `ORD${counter?.sequenceValue || 1000}`;
  }
  if (!this.orderDate) {
    this.orderDate = new Date();
  }
  next();
});

export default { name: Order.name, schema: OrderSchemaFile };


