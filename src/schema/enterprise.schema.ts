import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { commonDTO } from "src/common/DTO/commonDTO";
import { Connection, Document, Model } from "mongoose";
import { Counter, CounterDocument } from "./counter.schema";
import { isEnterpriseStatus } from "src/utils/constants";
export type EnterpriseDocument = enterprise & Document;

@Schema()
export class enterprise extends commonDTO {
  @Prop({ unique: true })
  enterpriseId: string;

  @Prop()
  shortDescription: string;

  @Prop()
  enterpriseName: string;

  @Prop()
  emailId: string;

  @Prop()
  mobileNumber: string;

  @Prop()
  BusinesSector: string;

  @Prop()
  location: string;

  @Prop()
  address1: string;

  @Prop()
  address2: string;

  @Prop()
  country: string;

  @Prop()
  state: string;

  @Prop()
  city: string;

  @Prop()
  otherCity: string;

  @Prop()
  postalCode: string;

  @Prop()
  uploadLogo: string;

  @Prop()
  companyOverview: string;

  @Prop()
  financialOverview: string;
  @Prop({ type: String, enum: isEnterpriseStatus, default: isEnterpriseStatus.ACTIVE })
  enterpriseStatus: isEnterpriseStatus;
}

export const enterpriseSchemaFile = SchemaFactory.createForClass(enterprise);

enterpriseSchemaFile.pre<EnterpriseDocument>('save', async function (next) {
  if (!this.enterpriseId) {
    const connection: Connection = this.collection.conn;
    const counterModel = connection.model<CounterDocument>('Counter');

    const counter = await counterModel.findOneAndUpdate(
      { field: 'enterpriseId' },
      { $inc: { sequenceValue: 1 } },
      { new: true, upsert: true }
    );

    // this.enterpriseId = counter?.sequenceValue || 30000; 
    this.enterpriseId = `ENT3000${counter?.sequenceValue}`
  }
  next();
});

export default { name: enterprise.name, schema: enterpriseSchemaFile };
