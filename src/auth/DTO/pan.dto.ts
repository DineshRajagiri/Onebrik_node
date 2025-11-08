
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator'



export class PanDTO {

    @IsNotEmpty()
    userId: string;

    @IsNotEmpty()
    panNumber: string;

}

