import { Prop } from "@nestjs/mongoose";

export class blogsDTO {
    @Prop()
    blogHeading: string;
  
    @Prop()
    description: string;
  
    @Prop()
    date: string;
  
    @Prop()
    image: string;
}