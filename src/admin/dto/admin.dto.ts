import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { region } from "src/schema/region.schema";
import { Roles } from "src/utils/constants";

export class AdminDTO {
    @IsOptional()
    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    fullName: string;

    @IsOptional()
    @IsString()
    mobileNo: string;

    @IsOptional()
    role: Roles;
    
    @IsOptional()
    @IsString()
    adminProfile: string;

    @IsOptional()
    @IsString()
    passwordHash: string;

    @IsOptional()
    @IsString()
    salt: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    @IsOptional()
    @IsString()
    regionId: region;
}