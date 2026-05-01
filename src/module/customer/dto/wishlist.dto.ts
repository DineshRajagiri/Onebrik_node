import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddWishlistItemDto {
  @IsNotEmpty()
  @IsString()
  productId: string;

  /** Optional — save a specific variant to the wishlist. */
  @IsOptional()
  @IsString()
  variantId?: string;
}
