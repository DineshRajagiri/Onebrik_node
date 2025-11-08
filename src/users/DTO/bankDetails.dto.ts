
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator'



export class BankDetailsDTO {
    @IsNotEmpty()
    userId: string;

    @IsNotEmpty()
    accountHolderName: string;

    @IsNotEmpty()
    accountNumber: string;

    @IsNotEmpty()
    ifscCode: string;

    @IsNotEmpty()
    bankName: string;

}

