import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsNotEmpty } from "class-validator";
import { commonDTO } from "src/common/DTO/commonDTO";
import { region } from "./region.schema";

export type deliveryBoyDetails = deliveryBoy & Document;
@Schema()
export class deliveryBoy extends commonDTO {

    @Prop()
    devlieryBoyName: string

    @Prop()
    emailid: string

    @Prop()
    phoneNO: string

    @Prop({ type: String, ref: "region" })
    regionId: region;

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

    @Prop()
    profilePicture: string

}
export const deliveryBoySchemaFile = SchemaFactory.createForClass(deliveryBoy);



