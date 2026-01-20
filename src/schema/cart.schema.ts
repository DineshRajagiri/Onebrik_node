import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { commonDTO } from "src/common/DTO/commonDTO";
import { Document } from "mongoose";
import { Device } from "./device.schema";

export type CartDetails = Cart & Document;

@Schema()
export class Cart extends commonDTO {
  @Prop({ type: String, ref: "Device" })
  deviceId: string;

  @Prop({ type: String, ref: "Customer" })
  customerId: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  totalAmount: number;

  @Prop({ default: 0 })
  totalItems: number;

  @Prop()
  status: string; // 'active' | 'abandoned' | 'converted'
}

export const CartSchemaFile = SchemaFactory.createForClass(Cart);

export default { name: Cart.name, schema: CartSchemaFile };


