import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { commonDTO } from "src/common/DTO/commonDTO";
import { Document, Connection } from "mongoose";
import { CounterDocument } from "./counter.schema";
import { Order } from "./order.schema";
import { PaymentStatus } from "src/utils/constants";

export type PaymentDetails = Payment & Document;

@Schema()
export class Payment extends commonDTO {
  @Prop()
  paymentId: string;

  @Prop({ type: String, ref: "Order", required: true })
  orderId: string;

  @Prop({ type: String, ref: "Customer", required: true })
  customerId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  paymentMethod: string; // 'cash' | 'card' | 'upi' | 'netbanking' | 'wallet'

  @Prop({ default: PaymentStatus.PENDING })
  paymentStatus: string; // 'PENDING' | 'SUCCESS' | 'FAILED'

  @Prop()
  transactionId: string;

  @Prop()
  paymentGateway: string; // 'razorpay' | 'stripe' | 'cashfree' etc.

  @Prop()
  paymentDate: Date;

  @Prop()
  failureReason: string;
}

export const PaymentSchemaFile = SchemaFactory.createForClass(Payment);

PaymentSchemaFile.pre<PaymentDetails>('save', async function (next) {
  if (!this.paymentId) {
    const connection: Connection = this.collection.conn;
    const counterModel = connection.model<CounterDocument>('Counter');

    const counter = await counterModel.findOneAndUpdate(
      { field: 'paymentId' },
      { $inc: { sequenceValue: 1 } },
      { new: true, upsert: true }
    );
    this.paymentId = `PAY${counter?.sequenceValue || 1000}`;
  }
  next();
});

export default { name: Payment.name, schema: PaymentSchemaFile };


