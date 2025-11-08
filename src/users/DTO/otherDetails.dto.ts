
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator'



export class OtherDetailsDTO {

    @IsNotEmpty()
    userId: string;

    @IsNotEmpty()
    experiences: string;

    @IsNotEmpty()
    incomeRange: string;

    @IsNotEmpty()
    professions: string;

}

