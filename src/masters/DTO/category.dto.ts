import { Prop } from "@nestjs/mongoose"
import { IsNotEmpty } from "class-validator"


export class categoryDTO {
  @Prop()
   @IsNotEmpty()
  categoryName: string

  @Prop()
  discription:string

}
