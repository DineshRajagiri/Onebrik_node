import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { commonDTO } from "src/common/DTO/commonDTO";
import { Connection, Document, Model, Types } from "mongoose";
import { Counter, CounterDocument } from "./counter.schema";
import { isDealStatus } from "src/utils/constants";

export type DealsDocument = deals & Document;
@Schema()
export class deals extends commonDTO {

  @Prop()
    dealId: string;  
  @Prop()
  dealType: string;

  @Prop()
  enterpriseId: string;

  @Prop()
  vendorId: string;

  @Prop({ type: String, ref: 'user' })
  userId: string;

  @Prop()
  dealValue: number;

  @Prop()
  minimumValue: string;

  @Prop()
  maximumValue: string;

  @Prop()
  dealStartDate: string;

  @Prop()
  expiryDate: string;

  @Prop()
  repaymentDate: string;

  @Prop()
  grossYiled: string;

  @Prop()
  netYield: number;

  @Prop()
  xScoreValue: string;

  @Prop()
  dealReport: string;

  @Prop()
  enterpriseInvoice: string;

  @Prop()
  enterpriseInvoiceToShow: string;
  @Prop()
  tenure?: string;
  @Prop({ type: String, enum: isDealStatus, default: isDealStatus.INACTIVE })
  dealStatus: isDealStatus;
  @Prop() 
  remainingValue: number;
  
  @Prop()
  purchasedValue: number;
 @Prop()
 investmentAmount: number;

 @Prop()
   purchasedAmount?: number;

 
   @Prop()
   dateOfPurchase: Date;
 
   @Prop()
   tdsOnInterest: number;
 
   @Prop()
   totalReceivableAmount: number;
 
   @Prop()
   interestAmount: number;
   
   @Prop()
   maturityAmount: number;
   
}

export const dealsSchemaFile = SchemaFactory.createForClass(deals);

dealsSchemaFile.pre<DealsDocument>('save', async function (next) {
  if (this.purchasedAmount === undefined) {
    if (!this.dealType) {
      const connection: Connection = this.collection.conn;
      const counterModel = connection.model<CounterDocument>('Counter');
      const counter = await counterModel.findOneAndUpdate(
        { field: 'dealType' },
        { $inc: { sequenceValue: 1 } },
        { new: true, upsert: true }
      );
      this.dealType = `ENT3000${counter?.sequenceValue}`;
    }

    // Optional: Defaulting dealStatus only for deal creation
    if (!this.dealStatus) {
      this.dealStatus = isDealStatus.INACTIVE;
    }
  } else {
    // Remove dealStatus explicitly for purchases
    this.set('dealStatus', undefined);
  }

  next();
});



export default { name: deals.name, schema: dealsSchemaFile };