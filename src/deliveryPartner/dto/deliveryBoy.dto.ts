import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator"
import { region } from "src/schema/region.schema"

export class deliveryBoyDTO {
    @IsNotEmpty()
    @IsString()
    devlieryBoyName: string

    @IsOptional()
    @IsEmail()
    emailid: string

    @IsOptional()
    @IsString()
    phoneNO: string

    @IsOptional()
    @IsString()
    regionId: region

    @IsOptional()
    @IsString()
    idProof: string

    @IsOptional()
    @IsString()
    address: string

    @IsOptional()
    @IsString()
    vechicleCBook: string

    @IsOptional()
    @IsString()
    vechicleNumber: string

    @IsOptional()
    @IsString()
    physicalDocuments: string

    @IsOptional()
    @IsString()
    dob: string

    @IsOptional()
    @IsString()
    bankAccountNumber: string

    @IsOptional()
    @IsString()
    bankIfscCode: string

    @IsOptional()
    @IsString()
    bankAccountHolderName: string

    @IsOptional()
    @IsString()
    branchName: string

    @IsOptional()
    @IsString()
    profilePicture: string
}