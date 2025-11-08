import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { wallet } from 'src/schema/wallet.schema';
import { PaymentStatus } from 'src/utils/constants';


export class walletDTO {
  @Prop({ default: 0.0 })
  walletBalance: number;

  @Prop({ default: 0.0 })
  investedAmount: number;

  @Prop({ required: true })
  userId: string;

  @Prop({ default: 0.0 })
  gainedAmount: number;
 
@Prop()
amount: number;

@Prop()
@IsEnum(PaymentStatus)
status: PaymentStatus;
@Prop({ enum: ['wallet', 'upi'],})
paymentType: string; 




}
export const WalletSchema = SchemaFactory.createForClass(wallet);