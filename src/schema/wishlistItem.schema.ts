import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { commonDTO } from 'src/common/DTO/commonDTO';
import { Document } from 'mongoose';

export type WishlistItemDetails = WishlistItem & Document;

/**
 * A single product (+ optional variant) saved in a wishlist.
 * Mirrors the CartItem pattern — no quantity, no price stored here
 * (price is always fetched live from the product/variant).
 */
@Schema()
export class WishlistItem extends commonDTO {
  @Prop({ type: String, ref: 'Wishlist', required: true })
  wishlistId: string;

  @Prop({ type: String, ref: 'Product', required: true })
  productId: string;

  /** Optional — if the customer saved a specific variant. */
  @Prop({ type: String, ref: 'productVariants' })
  variantId: string;
}

export const WishlistItemSchemaFile = SchemaFactory.createForClass(WishlistItem);

export default { name: WishlistItem.name, schema: WishlistItemSchemaFile };
