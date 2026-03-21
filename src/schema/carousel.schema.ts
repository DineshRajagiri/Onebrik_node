import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { commonDTO } from 'src/common/DTO/commonDTO';

export type CarouselDocument = Carousel & Document; 
@Schema()
export class Carousel extends commonDTO {
  @Prop({ required: true })
  imageUrl: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;
}


export const CarouselSchema = SchemaFactory.createForClass(Carousel);