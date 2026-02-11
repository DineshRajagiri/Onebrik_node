import { BadRequestException, Body, Controller, Delete, Get, Inject, Param, Post, Put, Query, Req, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { Services } from 'src/utils/constants';
import { IInventoryService, PaginationQuery } from './inventory';
import { Public } from 'src/decorators/public.decorator';
import { attributesDTO } from './dto/attributes.dto';
import { attributesValuesDTO } from './dto/attributesValues.dto';
import { inventoryCategoryDTO } from './dto/inventoryCategory.dto';
import { productDTO } from './dto/products.dto';
import { productVariantsDTO } from './dto/productVariants.dto';
import { VariantImagesDTO } from './dto/variantImages.dto';
import { VariantAttributeValuesDTO } from './dto/variantAttributeValues.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Request } from 'express';
import { CreateFullProductDTO } from './dto/createFullProduct.dto';
import { SafeSwaggerClassDecorator, SafeSwaggerDecorator } from 'src/common/decorators/safe-swagger.decorator';

// Safe wrapper for documentation - errors won't affect the API
const SafeInventoryTags = SafeSwaggerClassDecorator(() => {
    const { InventoryTags } = require('../doc/inventory/inventory.swagger');
    return InventoryTags;
});

const SafeInventoryDecorators = {
    createAttribute: SafeSwaggerDecorator(() => {
        const { InventoryDecorators } = require('../doc/inventory/inventory.swagger');
        return InventoryDecorators.createAttribute;
    }),
    createAttributeValue: SafeSwaggerDecorator(() => {
        const { InventoryDecorators } = require('../doc/inventory/inventory.swagger');
        return InventoryDecorators.createAttributeValue;
    }),
    createInventoryCategory: SafeSwaggerDecorator(() => {
        const { InventoryDecorators } = require('../doc/inventory/inventory.swagger');
        return InventoryDecorators.createInventoryCategory;
    }),
    createVariantImages: SafeSwaggerDecorator(() => {
        const { InventoryDecorators } = require('../doc/inventory/inventory.swagger');
        return InventoryDecorators.createVariantImages;
    }),
    createFullProduct: SafeSwaggerDecorator(() => {
        const { InventoryDecorators } = require('../doc/inventory/inventory.swagger');
        return InventoryDecorators.createFullProduct;
    }),
    getAllProducts: SafeSwaggerDecorator(() => {
        const { InventoryDecorators } = require('../doc/inventory/inventory.swagger');
        return InventoryDecorators.getAllProducts;
    }),
    getProductById: SafeSwaggerDecorator(() => {
        const { InventoryDecorators } = require('../doc/inventory/inventory.swagger');
        return InventoryDecorators.getProductById;
    }),
    updateFullProduct: SafeSwaggerDecorator(() => {
        const { InventoryDecorators } = require('../doc/inventory/inventory.swagger');
        return InventoryDecorators.updateFullProduct;
    }),
    deleteProduct: SafeSwaggerDecorator(() => {
        const { InventoryDecorators } = require('../doc/inventory/inventory.swagger');
        return InventoryDecorators.deleteProduct;
    })
};

@SafeInventoryTags
@Controller('inventory')
export class InventoryController {
    constructor(@Inject(Services.INVENTORY) private service: IInventoryService) { }

    @Public()
    @Post('createAttribute')
    @SafeInventoryDecorators.createAttribute
    async createAttribute(@Body() dto: attributesDTO) {
        return await this.service.createAttribute(dto);
    }

    @Public()
    @Post('createAttributevalue')
    @SafeInventoryDecorators.createAttributeValue
    async createAttributeValue(@Body() dto: attributesValuesDTO) {
        return await this.service.createAttributeValue(dto);
    }

    @Public()
    @Post('createInventoryCategory')
    @SafeInventoryDecorators.createInventoryCategory
    @UseInterceptors(
        FileInterceptor('image', {
            storage: diskStorage({
                destination: './uploads/category-images',
                filename: (req, file, cb) => {
                    const unique =
                        Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const clean = file.originalname.replace(/\s+/g, '-');
                    cb(null, `${unique}-${clean}`);
                },
            }),
        }),
    )
    async createInventoryCategory(
        @UploadedFile() file: Express.Multer.File,
        @Body() dto: inventoryCategoryDTO,
        @Req() req: Request,
    ) {

        if (!file) {
            throw new BadRequestException("Category image is required");
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const imageUrl = `${baseUrl}/uploads/category-images/${file.filename}`;

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
    @SafeInventoryDecorators.createVariantImages
    @UseInterceptors(
        FilesInterceptor('images', 10, {
            storage: diskStorage({
                destination: './uploads/variant-images',
                filename: (req, file, callback) => {
                    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const clean = file.originalname.replace(/\s+/g, '-');
                    callback(null, `${unique}-${clean}`);
                }
            })
        })
    )
    async createVariantImages(
        @UploadedFiles() files: Express.Multer.File[],
        @Body('productVariantId') productVariantId: string,
        @Req() req: Request,
    ) {
        if (!productVariantId) {
            throw new BadRequestException("productVariantId is required");
        }

        if (!files || files.length === 0) {
            throw new BadRequestException("No images uploaded");
        }
        const base = `${req.protocol}://${req.get('host')}`;
        const fileUrls = files.map(f => `${base}/uploads/variant-images/${f.filename}`);

        return this.service.createVariantImages(productVariantId, fileUrls);
    }

    @Public()
    @Post("createProducts")
    @SafeInventoryDecorators.createFullProduct
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
    upsertInventoryCategory(@Body() dto: inventoryCategoryDTO & { id?: string }) {
        return this.service.upsertInventoryCategory(dto);
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
    @SafeInventoryDecorators.updateFullProduct
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
            storage: diskStorage({
                destination: './uploads/variant-images',
                filename: (req, file, callback) => {
                    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const clean = file.originalname.replace(/\s+/g, '-');
                    callback(null, `${unique}-${clean}`);
                }
            })
        })
    )
    async updateVariantImages(
        @Param('productVariantId') productVariantId: string,
        @UploadedFiles() files: Express.Multer.File[],
        @Req() req: Request
    ) {
        if (!productVariantId) {
            throw new BadRequestException("productVariantId is required");
        }

        if (!files || files.length === 0) {
            throw new BadRequestException("No images uploaded");
        }

        const base = `${req.protocol}://${req.get('host')}`;
        const fileUrls = files.map(f => `${base}/uploads/variant-images/${f.filename}`);

        return this.service.updateVariantImages(productVariantId, fileUrls);
    }

    @Public()
    @Get('GetValuesByattributeId/:attributeId')
    async getAttributeValuesById(
        @Param('attributeId') attributeId: string,
        @Query() query: any
    ) {
        return this.service.getAttributeValuesbyattributeid(attributeId, query);
    }

    @Public()
    @Get('getProductById/:id')
    @SafeInventoryDecorators.getProductById
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
    @SafeInventoryDecorators.getAllProducts
    async getAllProducts(@Query() query: PaginationQuery) {
        return this.service.getAllProducts(query);
    }

    @Public()
    @Delete('deleteProduct/:id')
    @SafeInventoryDecorators.deleteProduct
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
}