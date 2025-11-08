import { Prop } from "@nestjs/mongoose";
import { IsMongoId, IsNotEmpty } from "class-validator";



export class profileImageDTO{
    @Prop()
    userId: string;
    @Prop()
    profileImage: string;

}


