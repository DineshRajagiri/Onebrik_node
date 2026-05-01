import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { commonDTO } from 'src/common/DTO/commonDTO';
import { Document } from 'mongoose';

export type WishlistDetails = Wishlist & Document;

/**
 * One wishlist per guest (deviceId) or per logged-in customer (customerId).
 * Mirrors the Cart pattern exactly.
 */
@Schema()
export class Wishlist extends commonDTO {
  /** Guest user identifier — cleared once linked to a customer. */
  @Prop({ type: String, ref: 'Device' })
  deviceId: string;

  /** Logged-in customer identifier. */
  @Prop({ type: String, ref: 'Customer' })
  customerId: string;

  /** Total number of items in the wishlist. */
  @Prop({ default: 0 })
  totalItems: number;
}

export const WishlistSchemaFile = SchemaFactory.createForClass(Wishlist);

export default { name: Wishlist.name, schema: WishlistSchemaFile };
