import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty, IsString } from 'class-validator';
import { Document, SchemaTypes, Types } from 'mongoose';
import { commonDTO } from 'src/common/DTO/commonDTO';
import { withdrawalStatus } from 'src/utils/constants';

export type withdrawalDetails = withdrawal & Document;

@Schema()
export class withdrawal extends commonDTO {
    @Prop()
    amount: number;

    @Prop()  
    dateOfTransaction: Date;

    @Prop({ required: true })
    requestedOn: Date;

    @Prop({ required: false })  
    amountRequested: number;

    @Prop({ type: String, enum: Object.values(withdrawalStatus) }) 
    status: withdrawalStatus;

    @Prop()
    remarks: string;

    @Prop({ required: true })  
    userId: string;

    @Prop()
    walletBalance: number;
}

export const withdrawalSchemaFile = SchemaFactory.createForClass(withdrawal);
