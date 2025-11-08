
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator'



export class NomineeDTO {

    @IsNotEmpty()
    userId: string;

    @IsNotEmpty()
    nomineeName: string;

    @IsNotEmpty()
    nomineeEmail: string;

    @IsNotEmpty()
    nomineeMobileNumber: string;

    @IsNotEmpty()
    relationship: string;

    @IsNotEmpty()
    nomineeDob: string;

    @IsNotEmpty()
    nomineeAdress: string;
}

