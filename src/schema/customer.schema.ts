import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { commonDTO } from "src/common/DTO/commonDTO";
import { Document, Connection } from "mongoose";
import { CounterDocument } from "./counter.schema";

export type CustomerDetails = Customer & Document;

@Schema()
export class Customer extends commonDTO {
  @Prop()
  customerId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  mobileNumber: string;

  @Prop()
  passwordHash: string;

  @Prop({ type: String, ref: "Device" })
  deviceId: string;

  @Prop({ default: true })
  isEmailVerified: boolean;

  @Prop({ default: true })
  isMobileVerified: boolean;
}

export const CustomerSchemaFile = SchemaFactory.createForClass(Customer);

CustomerSchemaFile.pre<CustomerDetails>('save', async function (next) {
  if (!this.customerId) {
    const connection: Connection = this.collection.conn;
    const counterModel = connection.model<CounterDocument>('Counter');

    const counter = await counterModel.findOneAndUpdate(
      { field: 'customerId' },
      { $inc: { sequenceValue: 1 } },
      { new: true, upsert: true }
    );
    this.customerId = `CUST${counter?.sequenceValue || 1000}`;
  }
  next();
});

export default { name: Customer.name, schema: CustomerSchemaFile };


