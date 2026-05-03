import { BadRequestException, Body, Controller, Delete, Get, Inject, Param, Post, Put, Query, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { Services } from 'src/utils/constants';
import { IInventoryService, PaginationQuery } from './inventory';
import { Public } from 'src/decorators/public.decorator';
import { attributesDTO } from './dto/attributes.dto';
import { attributesValuesDTO } from './dto/attributesValues.dto';
import { inventoryCategoryDTO } from './dto/inventoryCategory.dto';
import { productDTO } from './dto/products.dto';
import { productVariantsDTO } from './dto/productVariants.dto';
import { VariantAttributeValuesDTO } from './dto/variantAttributeValues.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CreateFullProductDTO } from './dto/createFullProduct.dto';
import { AwsS3BucketService } from 'src/common/services/aws-s3-bucket/aws-s3-bucket.service';

@Controller('inventory')
export class InventoryController {
    constructor(@Inject(Services.INVENTORY) private service: IInventoryService,
        private readonly awsS3BucketService: AwsS3BucketService,) { }

    @Public()
    @Post('createAttribute')
    async createAttribute(@Body() dto: attributesDTO) {
        return await this.service.createAttribute(dto);
    }

    @Public()
    @Post('createAttributevalue')
    async createAttributeValue(@Body() dto: attributesValuesDTO) {
        return await this.service.createAttributeValue(dto);
    }

    @Public()
    @Post('createInventoryCategory')
    @UseInterceptors(FileInterceptor('image'))
    async createInventoryCategory(
        @UploadedFile() file: Express.Multer.File,
        @Body() dto: inventoryCategoryDTO,
    ) {
        if (!file) {
            throw new BadRequestException("Category image is required");
        }

        const imageUrl = await this.awsS3BucketService.uploadFile(
            file,
            'category-images',
        );

        return this.service.createInventoryCategory(dto, imageUrl);
    }



    @Public()
    @Post('createProductVariant')
    async createProductVariant(@Body() dto: productVariantsDTO) {
        return this.service.createProductVariant(dto);
    }

    @Public()
    @Post('CreateVariantAttributeValue')
    async createVariantAttributeValue(@Body() dto: VariantAttributeValuesDTO) {
        return this.service.createVariantAttributeValue(dto);
    }


    @Public()
    @Post('createVariantImages')
    @UseInterceptors(
        FilesInterceptor('images', 10, {
            storage: memoryStorage(),
        }),
    )
    async createVariantImages(
        @UploadedFiles() files: Express.Multer.File[],
        @Body('productVariantId') productVariantId: string,
    ) {
        if (!productVariantId) {
            throw new BadRequestException("productVariantId is required");
        }

        if (!files || files.length === 0) {
            throw new BadRequestException("No images uploaded");
        }

        const uploadPromises = files.map(file =>
            this.awsS3BucketService.uploadFile(file, 'variants')
        );

        const fileUrls = await Promise.all(uploadPromises);

        return this.service.createVariantImages(productVariantId, fileUrls);
    }


    @Public()
    @Post('uploadImage')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: memoryStorage(),
        }),
    )
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException("File is required");
        }

        const imageUrl = await this.awsS3BucketService.uploadFile(
            file,
            'variants',
        );

        return {
            success: true,
            url: imageUrl,
        };
    }

    @Public()
    @Post("createProducts")
    async createFullProduct(@Body() dto: CreateFullProductDTO) {
        return this.service.createFullProduct(dto);
    }

    @Public()
    @Post('upsertAttribute')
    upsertAttribute(@Body() dto: attributesDTO & { id?: string }) {
        return this.service.upsertAttribute(dto);
    }

    @Public()
    @Post('upsertAttributeValue')
    upsertAttributeValue(@Body() dto: attributesValuesDTO & { id?: string }) {
        return this.service.upsertAttributeValue(dto);
    }

    @Public()
    @Post('upsertInventoryCategory')
    @UseInterceptors(
        FileInterceptor('image', {
            storage: memoryStorage(),
        }),
    )
    async upsertInventoryCategory(
        @UploadedFile() file: Express.Multer.File,
        @Body() dto: inventoryCategoryDTO & { id?: string },
    ) {
        let imageUrl: string | undefined;

        if (file) {
            imageUrl = await this.awsS3BucketService.uploadFile(file, 'categories');
        }

        return this.service.upsertInventoryCategory(dto, imageUrl);
    }



    @Public()
    @Post('upsertProduct')
    upsertProduct(@Body() dto: productDTO & { id?: string }) {
        return this.service.upsertProduct(dto);
    }

    @Public()
    @Post('upsertVariantAttributeValues')
    upsertVariantAttributeValues(@Body() dto: VariantAttributeValuesDTO) {
        return this.service.upsertVariantAttributeValues(dto);
    }

    @Public()
    @Post('upsertProductVariant')
    upsertProductVariant(@Body() dto) {
        return this.service.upsertProductVariantWithAttributes(dto);
    }

    @Public()
    @Put('updateProduct/:id')
    async updateFullProduct(@Param('id') id: string, @Body() dto: CreateFullProductDTO) {
        return this.service.updateFullProduct(id, dto);
    }

    @Public()
    @Put('updateProductVariant/:id')
    async updateProductVariant(@Param('id') id: string, @Body() dto: productVariantsDTO) {
        return this.service.updateProductVariant(id, dto);
    }

    @Public()
    @Put('updateAttribute/:id')
    async updateAttribute(@Param('id') id: string, @Body() dto: attributesDTO) {
        return this.service.updateAttribute(id, dto);
    }

    @Public()
    @Put('updateAttributeValue/:id')
    async updateAttributeValue(@Param('id') id: string, @Body() dto: attributesValuesDTO) {
        return this.service.updateAttributeValue(id, dto);
    }

    @Public()
    @Put('updateInventoryCategory/:id')
    async updateInventoryCategory(@Param('id') id: string, @Body() dto: inventoryCategoryDTO) {
        return this.service.updateInventoryCategory(id, dto);
    }

    @Public()
    @Put('updateVariantAttributeValue/:productVariantId')
    async updateVariantAttributeValue(
        @Param('productVariantId') productVariantId: string,
        @Body() dto: VariantAttributeValuesDTO
    ) {
        return this.service.updateVariantAttributeValue(productVariantId, dto);
    }

    @Public()
    @Put('updateVariantImages/:productVariantId')
    @UseInterceptors(
        FilesInterceptor('images', 10, {
            storage: memoryStorage(),
        }),
    )
    async updateVariantImages(
        @Param('productVariantId') productVariantId: string,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        if (!productVariantId) {
            throw new BadRequestException("productVariantId is required");
        }

        if (!files || files.length === 0) {
            throw new BadRequestException("No images uploaded");
        }

        const uploadPromises = files.map(file =>
            this.awsS3BucketService.uploadFile(file, 'variants')
        );

        const fileUrls = await Promise.all(uploadPromises);

        return this.service.updateVariantImages(productVariantId, fileUrls);
    }


    @Public()
    @Get('getValuesByattributeId/:attributeId')
    async getAttributeValuesById(
        @Param('attributeId') attributeId: string,
        @Query() query: any
    ) {
        return this.service.getAttributeValuesbyattributeid(attributeId, query);
    }

    @Public()
    @Get('getProductById/:id')
    async getProductById(@Param('id') id: string) {
        return this.service.getProductById(id);
    }

    @Public()
    @Get('getProductVariantById/:id')
    async getProductVariantById(@Param('id') id: string) {
        return this.service.getProductVariantById(id);
    }

    @Public()
    @Get('getAttributeById/:id')
    async getAttributeById(@Param('id') id: string) {
        return this.service.getAttributeById(id);
    }

    @Public()
    @Get('getAttributeValueById/:id')
    async getAttributeValueById(@Param('id') id: string) {
        return this.service.getAttributeValueById(id);
    }

    @Public()
    @Get('getInventoryCategoryById/:id')
    async getInventoryCategoryById(@Param('id') id: string) {
        return this.service.getInventoryCategoryById(id);
    }

    @Public()
    @Get('getVariantAttributeValueById/:id')
    async getVariantAttributeValueById(@Param('id') id: string) {
        return this.service.getVariantAttributeValueById(id);
    }

    @Public()
    @Get('getVariantImageById/:id')
    async getVariantImageById(@Param('id') id: string) {
        return this.service.getVariantImageById(id);
    }

    @Public()
    @Get("getAllProducts")
    async getAllProducts(@Query() query: PaginationQuery) {
        return this.service.getAllProducts(query);
    }

    @Public()
    @Get("getAllAttributes")
    async getAllAttributes(@Query() query: PaginationQuery) {
        return this.service.getAllAttributes(query);
    }

    @Public()
    @Get("getAllAttributeValues")
    async getAllAttributeValues(@Query() query: PaginationQuery) {
        return this.service.getAllAttributeValues(query);
    }

    @Public()
    @Get("getAllInventoryCategories")
    async getAllInventoryCategories(@Query() query: PaginationQuery) {
        return this.service.getAllInventoryCategories(query);
    }

    @Public()
    @Get("getAllVariantAttributeValues")
    async getAllVariantAttributeValues(@Query() query: PaginationQuery) {
        return this.service.getAllVariantAttributeValues(query);
    }

    @Get('related/:productId')
    async getRelatedProducts(@Param('productId') productId: string) {
        return this.service.getRelatedProducts(productId);
    }

    @Public()
    @Delete('deleteProduct/:id')
    async deleteProduct(@Param('id') id: string) {
        return this.service.deleteProduct(id);
    }

    @Public()
    @Delete('deleteProductVariant/:id')
    async deleteProductVariant(@Param('id') id: string) {
        return this.service.deleteProductVariant(id);
    }

    @Public()
    @Delete('deleteAttributeValue/:id')
    async deleteAttributeValue(@Param('id') id: string) {
        return this.service.deleteAttributeValue(id);
    }

    @Public()
    @Delete('deleteAttribute/:id')
    async deleteAttribute(@Param('id') id: string) {
        return this.service.deleteAttribute(id);
    }

    @Public()
    @Delete('deleteCategory/:id')
    async deleteInventoryCategory(@Param('id') id: string) {
        return this.service.deleteInventoryCategory(id);
    }

    @Public()
    @Delete('deleteVariantAttributeValue/:id')
    async deleteVariantAttributeValue(@Param('id') id: string) {
        return this.service.deleteVariantAttributeValue(id);
    }

    @Public()
    @Delete('deleteVariantImage/:id')
    async deleteVariantImage(@Param('id') id: string) {
        return this.service.deleteVariantImage(id);
    }

    // ==============================
    // SEARCH
    // ==============================
    @Public()
    @Get('search')
    async searchProducts(
        @Query('q') q: string,
        @Query('page') page?: number,
        @Query('perPage') perPage?: number,
    ) {
        return this.service.searchProducts(q || '*', Number(page) || 1, Number(perPage) || 20);
    }

    /** One-time bulk sync — call this once to index all existing products into Typesense. */
    @Public()
    @Post('search/sync')
    async syncAllProductsToTypesense() {
        return this.service.syncAllProductsToTypesense();
    }

    // ==============================
    // FILTERS
    // ==============================
    /**
     * Get available filters for a category.
     * Query params: mainCategoryId, subCategoryId, subChildCategoryId
     * Returns: brands[], attributes[{name, values[]}], priceRange{min, max}
     */
    @Public()
    @Get('filters')
    async getFiltersByCategory(@Query() query: any) {
        return this.service.getFiltersByCategory(query);
    }
}