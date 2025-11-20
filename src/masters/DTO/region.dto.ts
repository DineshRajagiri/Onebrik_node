import { Prop } from "@nestjs/mongoose"
import { IsNotEmpty } from "class-validator"


export class regionDTO {
  @Prop()
  @IsNotEmpty()
  regionName: string

  @Prop()
  discription:string

  @Prop()
  city:string

}
