import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty, IsString } from 'class-validator';
import { Document, SchemaTypes, Types } from 'mongoose';
import { commonDTO } from 'src/common/DTO/commonDTO';
import { neftStatus } from 'src/utils/constants';
export type neftDetails = neft & Document;

@Schema()
export class neft extends commonDTO {
  @Prop()
  amount: string;

  @Prop()
  Date: string;

  @Prop()
  transactionID: string;

  @Prop()
  bankName: string;

  @Prop()
  branchName: string;

  @Prop({ type: String, enum: neftStatus })
  status: neftStatus;

  @Prop()
  uploadImage: string;

  @Prop()
  remarks: string;
    @Prop()
      userId: string;

}

export const neftSchemaFile = SchemaFactory.createForClass(neft);


