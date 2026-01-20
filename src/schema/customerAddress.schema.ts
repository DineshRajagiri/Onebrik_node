import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { commonDTO } from "src/common/DTO/commonDTO";
import { Document } from "mongoose";
import { Customer } from "./customer.schema";

export type CustomerAddressDetails = CustomerAddress & Document;

@Schema()
export class CustomerAddress extends commonDTO {
  @Prop({ type: String, ref: "Customer", required: true })
  customerId: string;

  @Prop({ required: true })
  addressType: string; // 'home' | 'work' | 'other'

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  mobileNumber: string;

  @Prop({ required: true })
  addressLine1: string;

  @Prop()
  addressLine2: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  postalCode: string;

  @Prop({ required: true })
  country: string;

  @Prop({ default: false })
  isDefault: boolean;

  @Prop()
  landmark: string;
}

export const CustomerAddressSchemaFile = SchemaFactory.createForClass(CustomerAddress);

export default { name: CustomerAddress.name, schema: CustomerAddressSchemaFile };


