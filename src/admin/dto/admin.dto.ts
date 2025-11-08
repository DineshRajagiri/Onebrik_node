import { Prop } from "@nestjs/mongoose";
import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { isAdminStatus, Roles } from "src/utils/constants";

export class AdminDTO {
    @Prop()
    email: string;

    @Prop()
    fullName: string;

    @Prop()
 
    mobileNo: string;

    @Prop({ type: String, enum: Roles })
    role: Roles;
    @Prop()
    adminProfile: string;
 

    @Prop({ default: null })
    passwordHash: string;

    @Prop()
    salt: string;


    @Prop({ required: true })
    password: string;
 
   
    @Prop({ type: String, enum: isAdminStatus, default: isAdminStatus.ACTIVE }) 
    adminStatus: isAdminStatus;
    @IsNotEmpty()
    @IsString()
    oldPassword: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6, { message: 'New password must be at least 6 characters long' })
    newPassword: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6, { message: 'Confirm password must be at least 6 characters long' })
    confirmPassword: string;
}