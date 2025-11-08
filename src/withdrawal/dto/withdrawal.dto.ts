import { Prop } from "@nestjs/mongoose";
import { IsNotEmpty, IsNumber, IsOptional, Min } from "class-validator";
import { withdrawalStatus } from "src/utils/constants";


export class withdrawalDTO {
    @IsNumber()
    amount: number;

    @Prop()
    dateOfTransaction: Date;


    @Prop()
    requestedOn: Date;

    @Prop()
    amountRequested: number;

    @Prop()
    remarks: string;
    @Prop()
    userId: string;
    @Prop({ type: String, enum: withdrawalStatus, default: withdrawalStatus.PENDING })
    @IsOptional()
    status?: withdrawalStatus;







}