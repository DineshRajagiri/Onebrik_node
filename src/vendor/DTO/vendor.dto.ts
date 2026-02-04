import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { admin } from "src/schema/admin.schema";
import { category } from "src/schema/category.schema";
import { region } from "src/schema/region.schema";

export class vendorDTO {
    @IsNotEmpty()
    @IsString()
    vendorName: string;

    @IsOptional()
    @IsEmail()
    emailID: string;

    @IsOptional()
    @IsString()
    mobileNumber: string;

    @IsOptional()
    @IsString()
    category: string;

    @IsOptional()
    @IsString()
    region: string;

    @IsOptional()
    @IsString()
    adress1: string;

    @IsOptional()
    @IsString()
    country: string;

    @IsOptional()
    @IsString()
    state: string;

    @IsOptional()
    @IsString()
    city: string;

    @IsOptional()
    @IsString()
    postalCode: string;

    @IsOptional()
    @IsString()
    gstNumber: string;

    @IsOptional()
    @IsString()
    uploadLogo: string;

    @IsNotEmpty()
    @IsString()
    adminId: admin;

    @IsNotEmpty()
    @IsString()
    regionId: region;

    @IsNotEmpty()
    @IsString()
    categoryId: category;
}
