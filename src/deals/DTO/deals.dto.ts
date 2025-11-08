import { Prop } from "@nestjs/mongoose";
import { IsNotEmpty } from "class-validator";
import { dealTypes, isDealStatus } from "src/utils/constants";

export class dealsDTO {
  @Prop()
  dealId: string;
  @Prop({ type: String, enum: dealTypes })
  @IsNotEmpty()
  dealType: string;

  @Prop()
  enterpriseId: string;

  @Prop()
  userId: string;

  @Prop()
  @IsNotEmpty()
  vendorId: string;

  @Prop()
  @IsNotEmpty()
  dealValue: number;

  @Prop()
  @IsNotEmpty()
  minimumValue: string;

  @Prop()
  @IsNotEmpty()
  maximumValue: string;

  @Prop()
  @IsNotEmpty()
  dealStartDate: string;

  @Prop()
  @IsNotEmpty()
  expiryDate: string;

  @Prop()
  @IsNotEmpty()
  repaymentDate: string;

  @Prop()
  grossYiled: string;

  @Prop()
  netYield: number;

  @Prop()
  @IsNotEmpty()
  xScoreValue: string;

  @Prop()
  dealReport: string;

  @Prop()
  enterpriseInvoice: string;
  @Prop()
  investmentAmount: number;


  @Prop()
  enterpriseInvoiceToShow: string;
  @Prop()
  remainingValue?: number;
  @Prop()
  purchasedValue?: number;
  @Prop({ type: String, enum: isDealStatus })
  dealStatus: isDealStatus;

  @Prop()
  dateOfPurchase: Date;
  @Prop()
  purchasedAmount?: number;

  @Prop()
  tdsOnInterest: number;

  @Prop()
  totalReceivableAmount: number;

  @Prop()
  interestAmount: number;

  @Prop()
  maturityAmount: number;
}

