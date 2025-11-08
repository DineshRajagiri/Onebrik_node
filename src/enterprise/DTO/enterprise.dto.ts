import { Prop } from "@nestjs/mongoose"
import { IsNotEmpty, isNotEmpty, IsOptional } from "class-validator"
import { isEnterpriseStatus } from "src/utils/constants"

export class enterpriseDTO {

    @Prop()
    @IsNotEmpty()
    enterpriseName: string

    @Prop()
    shortDescription: string

    @Prop()
    emailId: string

    @Prop()
    mobileNumber: string

    @Prop()
    BusinesSector: string

    @Prop()
    location: string

    @Prop()
    address1: string

    @Prop()
    @IsOptional()
    address2: string

    @Prop()
    country: string

    @Prop()
    state: string

    @Prop()
    city: string

    @Prop()
    otherCity: string

    @Prop()
    postalCode: string

    @Prop()
    uploadLogo: string

    @Prop()
    companyOverview: string

    @Prop()
    financialOverview: string


    @Prop({ type: String, enum: isEnterpriseStatus, default: isEnterpriseStatus.ACTIVE })
    enterpriseStatus: isEnterpriseStatus;
}