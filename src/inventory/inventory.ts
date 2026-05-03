import { attributesDTO } from "./dto/attributes.dto";
import { attributesValuesDTO } from "./dto/attributesValues.dto";
import { inventoryCategoryDTO } from "./dto/inventoryCategory.dto";
import { Types } from "mongoose";
import { productDTO } from "./dto/products.dto";
import { productVariantsDTO } from "./dto/productVariants.dto";
import { VariantAttributeValuesDTO } from "./dto/variantAttributeValues.dto";
import { VariantImagesDTO } from "./dto/variantImages.dto";
import { CreateFullProductDTO } from "./dto/createFullProduct.dto";

export interface PaginationQuery {
    page?: number;
    limit?: number;
    search?: string;
}

export interface IInventoryService {
    createAttribute(dto: attributesDTO): Promise<any>;
    createAttributeValue(dto: attributesValuesDTO): Promise<any>;
    // createInventoryCategory(dto: inventoryCategoryDTO): Promise<any>;
    createInventoryCategory(dto: inventoryCategoryDTO, imageUrl: string): Promise<any>;
    createProduct(dto: productDTO): Promise<any>;
    createProductVariant(dto: productVariantsDTO): Promise<any>;
    createVariantAttributeValue(dto: VariantAttributeValuesDTO): Promise<any>;
    createVariantImages(productVariantId: string, imageUrls: string[]): Promise<any>;
    createFullProduct(dto: CreateFullProductDTO): Promise<any>;


    updateProduct(id: string, dto: productDTO): Promise<any>;
    updateProductVariant(id: string, dto: productVariantsDTO): Promise<any>;
    updateAttribute(id: string, dto: attributesDTO): Promise<any>;
    updateAttributeValue(id: string, dto: attributesValuesDTO): Promise<any>;
    updateInventoryCategory(id: string, dto: inventoryCategoryDTO): Promise<any>;
    updateVariantAttributeValue(productVariantId: string, dto: VariantAttributeValuesDTO): Promise<any>;
    updateVariantImages(productVariantId: string, imageUrls: string[]): Promise<any>;
    updateFullProduct(productId: string, dto: CreateFullProductDTO): Promise<any>;


    upsertAttribute(dto: attributesDTO & { id?: string }): Promise<any>;
    upsertAttributeValue(dto: attributesValuesDTO & { id?: string }): Promise<any>;
    upsertInventoryCategory(dto: inventoryCategoryDTO & { id?: string }, imageUrl?: string): Promise<any>;
    upsertProduct(dto: productDTO & { id?: string }): Promise<any>;
    upsertProductVariant(dto: productVariantsDTO & { id?: string }): Promise<any>;
    upsertVariantAttributeValues(dto: VariantAttributeValuesDTO & { id?: string }): Promise<any>;
    upsertVariantImages(dto: VariantImagesDTO & { id?: string }): Promise<any>;
    upsertProductVariantWithAttributes(dto: productVariantsDTO & { id?: string }): Promise<any>;

    getAllInventoryCategories(query: PaginationQuery): Promise<any>;
    getAllAttributes(query: PaginationQuery): Promise<any>;
    getAllAttributeValues(query: any): Promise<any>;
    getAllProducts(query: PaginationQuery): Promise<any>;
    getAllProductVariants(query: PaginationQuery): Promise<any>;
    getAllVariantAttributeValues(query: PaginationQuery): Promise<any>;
    getAllVariantImages(query: PaginationQuery): Promise<any>;
    getAllFullProductsDetails(query: PaginationQuery): Promise<any>;
    getRelatedProducts(productId: string): Promise<any>;



    getAttributeValuesbyattributeid(attributeId: string, query?: PaginationQuery): Promise<any>;
    getProductById(id: string): Promise<any>;
    getProductVariantById(id: string): Promise<any>;
    getAttributeById(id: string): Promise<any>;
    getAttributeValueById(id: string): Promise<any>;
    getInventoryCategoryById(id: string): Promise<any>;
    getVariantAttributeValueById(id: string): Promise<any>;
    getVariantImageById(id: string): Promise<any>;
    getProductDetailsById(id: string): Promise<any>;



    deleteAttributeValue(id: string): Promise<any>;
    deleteAttribute(id: string): Promise<any>;
    deleteInventoryCategory(id: string): Promise<any>;
    deleteProduct(id: string): Promise<any>;
    deleteProductVariant(id: string): Promise<any>;
    deleteVariantAttributeValue(id: string): Promise<any>;
    deleteVariantImage(id: string): Promise<any>;

    searchProducts(query: string, page?: number, perPage?: number): Promise<any>;
    syncAllProductsToTypesense(): Promise<any>;
    getFiltersByCategory(query: any): Promise<any>;
}