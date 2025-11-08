import { Prop } from "@nestjs/mongoose";
import { IsNotEmpty } from "class-validator";

export class xScoreDTO {
  @Prop()
  @IsNotEmpty()
  xScoreName: string;

  @Prop()
  @IsNotEmpty()
  xScoreValue: string;
}
