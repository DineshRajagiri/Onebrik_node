import { Prop } from "@nestjs/mongoose"
import { IsNotEmpty, IsOptional } from "class-validator"
import { isVendorStatus } from "src/utils/constants"

export class vendorDTO {

    @Prop()
    @IsNotEmpty()
    vendorName: string

    @Prop()

    emailID: string

    @Prop()

    mobileNumber: string

    @Prop()

    BusinesSector: string

    @Prop()

    location: string

    @Prop()

    adress1: string

    @Prop()
    @IsOptional()
    adress2: string

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

    @Prop({ type: String, enum: isVendorStatus, default: isVendorStatus.ACTIVE })
    vendorStatus: isVendorStatus;
}