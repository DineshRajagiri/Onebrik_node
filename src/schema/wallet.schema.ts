  import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
  import { IsEnum } from 'class-validator';
  import { Document } from 'mongoose';
  import { commonDTO } from 'src/common/DTO/commonDTO';
  import { PaymentStatus } from 'src/utils/constants';

  export type walletDetails = wallet & Document;

  @Schema()
  export class wallet extends commonDTO {
    @Prop()
    walletBalance: number;

    @Prop()
    investedAmount: number;

    @Prop()
    userId: string;

    @Prop()
    gainedAmount: number;
    
    @Prop()
    amount: number;
    
    @Prop()
    @IsEnum(PaymentStatus)
    status: PaymentStatus;
    @Prop({ enum: ['wallet', 'upi'], })
    paymentType: string;
    
    @Prop({ required: true })
    isTransaction:Boolean;

    @Prop({
      type: [
        {
          amount: Number,
          type: { type: String, enum: ['credit', 'debit'] },
          timestamp: { type: Date, default: Date.now },
        },
      ],
      default: undefined,
    })
    transactions: { amount: number; type: 'credit' | 'debit'; timestamp: Date }[];
  }

  export const walletSchemaFile = SchemaFactory.createForClass(wallet);
