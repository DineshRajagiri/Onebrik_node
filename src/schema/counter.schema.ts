import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CounterDocument = Counter & Document;

@Schema()
export class Counter {
  @Prop({ required: true, unique: true })
  field: string; 

  @Prop({ required: true })
  sequenceValue: number; 
}

export const CounterSchema = SchemaFactory.createForClass(Counter);
