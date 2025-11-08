
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator'



export class AadharDTO {

    @IsNotEmpty()
    userId: string;

    @IsNotEmpty()
    aadharName: string;

    @IsNotEmpty()
    aadharNumber: string;

    @IsNotEmpty()
    gender: string;

    @IsNotEmpty()
    dob: string;

    @IsNotEmpty()
    houseNo: string;

    @IsNotEmpty()
    street: string;

    @IsNotEmpty()
    landMark: string;

    @IsNotEmpty()
    state: string;
    district: string;
    country: string;
}

