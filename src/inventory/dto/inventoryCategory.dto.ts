import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { inventoryCategory } from "src/schema/inventoryCategory.schema";

export class inventoryCategoryDTO {
    @IsString()
    @IsNotEmpty()
    categoryName: string;
    
    @IsOptional()
    @IsString()
    parentId: inventoryCategory;
    
    @IsEnum(["MAIN", "SUB", "SUBCHILD"])
    @IsNotEmpty()
    level: string;
}