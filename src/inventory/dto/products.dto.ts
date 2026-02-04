import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { inventoryCategory } from "src/schema/inventoryCategory.schema";

export class productDTO {
    @IsNotEmpty()
    @IsString()
    productName: string;

    @IsOptional()
    @IsString()
    sku: string;

    @IsOptional()
    @IsString()
    price: string;

    @IsOptional()
    @IsString()
    description: string;

    @IsOptional()
    @IsString()
    brand: string;

    @IsOptional()
    @IsString()
    about: string;

    @IsOptional()
    @IsNumber()
    rating: number;

    @IsOptional()
    @IsNumber()
    discount: number;

    @IsOptional()
    @IsString()
    offer: string;

    @IsOptional()
    @IsString()
    mainCategoryId: inventoryCategory;

    @IsOptional()
    @IsString()
    subCategoryId: inventoryCategory;

    @IsOptional()
    @IsString()
    subChildCategoryId: inventoryCategory;
}