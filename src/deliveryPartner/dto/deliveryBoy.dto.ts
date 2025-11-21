import { Prop } from "@nestjs/mongoose"
import { IsNotEmpty, isNotEmpty, IsOptional } from "class-validator"
import { region } from "src/schema/region.schema"
import { isEnterpriseStatus } from "src/utils/constants"

export class deliveryBoyDTO {

    @Prop()
    @IsNotEmpty()
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

    @Prop()
    profilePicture: string



}