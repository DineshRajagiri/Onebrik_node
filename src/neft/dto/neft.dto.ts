import { Prop } from "@nestjs/mongoose";
import { IsNotEmpty, IsOptional } from "class-validator";
import { neftStatus } from "src/utils/constants";

export class neftDTO {
  @Prop()
  @IsNotEmpty()
  amount: string;

  @Prop()
  @IsNotEmpty()
  Date: string;

  @Prop()
  @IsNotEmpty()
  transactionID: string;

  @Prop()
  @IsNotEmpty()
  bankName: string;

  @Prop()
  @IsNotEmpty()
  branchName: string;

  @Prop({ type: String, enum: neftStatus, default: neftStatus.PENDING })
  @IsOptional() 
  status?: neftStatus;

  @Prop()
  uploadImage: string;

  @Prop()
  remarks: string;

   @Prop({ required: true })
       userId: string;

  
}