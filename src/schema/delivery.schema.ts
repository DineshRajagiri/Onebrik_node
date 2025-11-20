import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { IsNotEmpty } from "class-validator";
import { commonDTO } from "src/common/DTO/commonDTO";
import { region } from "./region.schema";

export type deliveryDetails = devliery & Document;
@Schema()
export class devliery extends commonDTO {
    @Prop()
    devlieryBoyName: string

    @Prop()
    emailid: string

    @Prop()
    phoneNO: string

    @Prop({ type: String, ref: "region" })
    regionId: region

    @Prop()
    idProof: string

    @Prop()
    address: string

    @Prop()
    vechicleCBook: string

    @Prop()
    vechicleNumber: string

    @Prop()
    physicalDocuments: string

    @Prop()
    dob: string

    @Prop()
    bankAccountNumber: string

    @Prop()
    bankIfscCode: string

    @Prop()
    bankAccountHolderName: string

    @Prop()
    branchName: string




}
export const devlierySchemaFile = SchemaFactory.createForClass(devliery);