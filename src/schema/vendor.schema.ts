import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { commonDTO } from "src/common/DTO/commonDTO";
import { isVendorStatus } from "src/utils/constants";
import { Connection, Document, Model } from "mongoose";
import { CounterDocument } from "./counter.schema";
export type vendorDetails = vendor & Document;
@Schema()
export class vendor extends commonDTO {
  @Prop()
  vendorId: string
  @Prop()
  vendorName: string

  @Prop()
  emailID: string

  @Prop()
  mobileNumber: string

  @Prop()
  BusinesSector: string

  @Prop()
  location: string

  @Prop()
  adress1: string

  @Prop()
  adress2: string

  @Prop()
  country: string

  @Prop()
  state: string

  @Prop()
  city: string

  @Prop()
  otherCity: string

  @Prop()
  postalCode: string

  @Prop()
  uploadLogo: string

  @Prop()
  companyOverview: string

  @Prop()
  financialOverview: string

  @Prop({ type: String, enum: isVendorStatus, default: isVendorStatus.ACTIVE })
  vendorStatus: isVendorStatus;
}
export const vendorSchemaFile = SchemaFactory.createForClass(vendor);

vendorSchemaFile.pre<vendorDetails>('save', async function (next) {
  if (!this.vendorId) {
    const connection: Connection = this.collection.conn;
    const counterModel = connection.model<CounterDocument>('Counter');

    const counter = await counterModel.findOneAndUpdate(
      { field: 'vendorId' },
      { $inc: { sequenceValue: 1 } },
      { new: true, upsert: true }
    );

    // this.vendorId = counter?.sequenceValue || 30000; 
    this.vendorId = `VEN3000${counter?.sequenceValue}`
  }
  next();
});

export default { name: vendor.name, schema: vendorSchemaFile };