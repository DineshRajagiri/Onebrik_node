import { BadRequestException, ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { attributes, AttributesDocument } from 'src/schema/attributes.schema';
import { attributesValues, AttributesValuesDocument } from 'src/schema/attributesValues.schema';
import { inventoryCategory, inventoryCategoryDocument } from 'src/schema/inventoryCategory.schema';
import { Product, ProductDocument } from 'src/schema/products.schema';
import { productVariants, productVariantsDocument } from 'src/schema/productVariants.schema';
import { VariantAttributeValues } from 'src/schema/variantAttributeValues.schema';
import { VariantImages, VariantImagesDocument } from 'src/schema/variantImages.schema';
import { productDTO } from './dto/products.dto';
import { productVariantsDTO } from './dto/productVariants.dto';
import { attributesDTO } from './dto/attributes.dto';
import { attributesValuesDTO } from './dto/attributesValues.dto';
import { inventoryCategoryDTO } from './dto/inventoryCategory.dto';
import { VariantAttributeValuesDTO } from './dto/variantAttributeValues.dto';
import { VariantImagesDTO } from './dto/variantImages.dto';
import { CreateFullProductDTO } from './dto/createFullProduct.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(attributes.name) private attributesModel: Model<AttributesDocument>,
    @InjectModel(attributesValues.name) private attributesValuesModel: Model<AttributesValuesDocument>,
    @InjectModel(inventoryCategory.name) private inventoryCategoryModel: Model<inventoryCategoryDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(productVariants.name) private productVarientsModel: Model<productVariantsDocument>,
    @InjectModel(VariantAttributeValues.name) private variantAttributeValuesModel: Model<VariantAttributeValues>,
    @InjectModel(VariantImages.name) private variantImageModel: Model<VariantImagesDocument>,
  ) { }

  private paginate(query: any) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 10);
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  private asId<T = any>(id: any): T {
    return id as unknown as T;
  }


  async createAttribute(dto: any) {
    try {
      if (!dto.attributename?.trim()) {
        throw new BadRequestException('Attribute name is required');
      }

      const attributename = dto.attributename.trim();

      const exists = await this.attributesModel.findOne({ attributename }).lean();
      if (exists) {
        throw new ConflictException('Attribute already exists');
      }

      const created = await this.attributesModel.create({
        attributename,
        description: dto.description ?? '',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return {
        success: true,
        message: 'Attribute created successfully',
        data: created,
      };

    } catch (err) {
      console.error('Error in createAttribute:', err);

      if (err instanceof BadRequestException || err instanceof ConflictException)
        throw err;

      throw new HttpException(
        'Unexpected error while creating attribute',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async createAttributeValue(dto: any) {
    try {
      if (!dto.attributeId) throw new BadRequestException('attributeId is required');
      if (!dto.value?.trim()) throw new BadRequestException('Value is required');

      const value = dto.value.trim();

      const exists = await this.attributesValuesModel.findOne({
        attributeId: dto.attributeId,
        value,
      }).lean();

      if (exists) {
        throw new ConflictException('Attribute value already exists');
      }

      const created = await this.attributesValuesModel.create({
        attributeId: dto.attributeId,
        value,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const populated = await this.attributesValuesModel
        .findById(created._id)
        .populate('attributeId', 'attributename description')
        .lean();

      return {
        success: true,
        message: 'Attribute value created successfully',
        data: populated,
      };

    } catch (err) {
      console.error('Error in createAttributeValue:', err);

      if (err instanceof BadRequestException || err instanceof ConflictException)
        throw err;

      throw new HttpException(
        'Unexpected error while creating attribute value',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // async createInventoryCategory(dto: inventoryCategoryDTO) {
  //   try {
  //     if (!dto.categoryName?.trim()) {
  //       throw new BadRequestException("Category name is required");
  //     }

  //     if (!dto.level?.trim()) {
  //       throw new BadRequestException("Category level is required");
  //     }

  //     const categoryName = dto.categoryName.trim();
  //     const level = dto.level.trim().toUpperCase();

  //     if (!["MAIN", "SUB", "SUBCHILD"].includes(level)) {
  //       throw new BadRequestException("Invalid level. Allowed: MAIN, SUB, SUBCHILD");
  //     }
  //     if (level === "MAIN" && dto.parentId) {
  //       throw new BadRequestException("MAIN category cannot have parentId");
  //     }

  //     if (level !== "MAIN" && !dto.parentId) {
  //       throw new BadRequestException(`${level} category must have parentId`);
  //     }

  //     const exists = await this.inventoryCategoryModel.findOne({ categoryName }).lean();
  //     if (exists) throw new ConflictException("Category name already exists");

  //     let parentId = null;
  //     let parentName = null;

  //     if (dto.parentId) {
  //       const parent = await this.inventoryCategoryModel.findById(dto.parentId).lean();
  //       if (!parent) throw new BadRequestException("Invalid parentId — parent category not found");

  //       parentId = parent._id;
  //       parentName = parent.categoryName;
  //     }

  //     const created = await this.inventoryCategoryModel.create({
  //       categoryName,
  //       parentId,
  //       level,
  //       createdAt: new Date(),
  //       updatedAt: new Date(),
  //     });

  //     const responseData = {
  //       _id: created._id,
  //       categoryName: created.categoryName,
  //       level: created.level,
  //       parentId: created.parentId,
  //       parentName: parentName,
  //       createdAt: created.createdAt,
  //       updatedAt: created.updatedAt,
  //     };

  //     return {
  //       success: true,
  //       message: "Inventory category created successfully",
  //       data: responseData,
  //     };

  //   } catch (err) {
  //     console.error("Error in createInventoryCategory:", err);

  //     throw new HttpException(
  //       err.message || "Unexpected error while creating category",
  //       HttpStatus.INTERNAL_SERVER_ERROR
  //     );
  //   }
  // }

  async createInventoryCategory(
    dto: inventoryCategoryDTO,
    imageUrl: string,
  ) {
    try {

      if (!dto.categoryName?.trim()) {
        throw new BadRequestException("Category name is required");
      }

      if (!dto.level?.trim()) {
        throw new BadRequestException("Category level is required");
      }

      if (!imageUrl) {
        throw new BadRequestException("Category image is required");
      }

      const categoryName = dto.categoryName.trim();
      const level = dto.level.trim().toUpperCase();

      if (!["MAIN", "SUB", "SUBCHILD"].includes(level)) {
        throw new BadRequestException(
          "Invalid level. Allowed: MAIN, SUB, SUBCHILD"
        );
      }

      if (level === "MAIN" && dto.parentId) {
        throw new BadRequestException(
          "MAIN category cannot have parentId"
        );
      }

      if (level !== "MAIN" && !dto.parentId) {
        throw new BadRequestException(
          `${level} category must have parentId`
        );
      }

      const exists = await this.inventoryCategoryModel
        .findOne({ categoryName })
        .lean();

      if (exists) {
        throw new ConflictException("Category name already exists");
      }

      let parentId = null;
      let parentName = null;

      if (dto.parentId) {
        const parent = await this.inventoryCategoryModel
          .findById(dto.parentId)
          .lean();

        if (!parent) {
          throw new BadRequestException("Invalid parentId");
        }

        parentId = parent._id;
        parentName = parent.categoryName;
      }

      const created = await this.inventoryCategoryModel.create({
        categoryName,
        level,
        parentId,
        imageUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return {
        success: true,
        message: "Inventory category created successfully",
        data: {
          _id: created._id,
          categoryName: created.categoryName,
          level: created.level,
          parentId: created.parentId,
          parentName,
          imageUrl: created.imageUrl,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
        },
      };

    } catch (err) {

      console.error("Error in createInventoryCategory:", err);

      if (
        err instanceof BadRequestException ||
        err instanceof ConflictException
      ) {
        throw err;
      }

      throw new HttpException(
        err.message || "Unexpected error while creating category",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }


  async createProduct(dto: productDTO) {
    try {
      if (!dto.productName?.trim()) {
        throw new BadRequestException("Product name is required");
      }

      if (dto.mainCategoryId) {
        const exists = await this.inventoryCategoryModel.findById(dto.mainCategoryId);
        if (!exists) throw new NotFoundException("Main category not found");
      }

      if (dto.subCategoryId) {
        const exists = await this.inventoryCategoryModel.findById(dto.subCategoryId);
        if (!exists) throw new NotFoundException("Sub category not found");
      }

      if (dto.subChildCategoryId) {
        const exists = await this.inventoryCategoryModel.findById(dto.subChildCategoryId);
        if (!exists) throw new NotFoundException("Sub-child category not found");
      }

      const productExists = await this.productModel.findOne({
        productName: dto.productName.trim(),
        mainCategoryId: dto.mainCategoryId ?? null,
        subCategoryId: dto.subCategoryId ?? null,
        subChildCategoryId: dto.subChildCategoryId ?? null
      }).lean();

      if (productExists) {
        throw new ConflictException(
          "Product with this name already exists in this category"
        );
      }

      let sku = dto.sku;
      if (!sku) {
        const randomCode = Math.floor(100000 + Math.random() * 900000);
        sku = `SKU-${randomCode}`;
      }

      const newProduct = await this.productModel.create({
        productName: dto.productName.trim(),
        sku,
        price: dto.price ?? "",
        description: dto.description ?? "",
        mainCategoryId: dto.mainCategoryId ?? null,
        subCategoryId: dto.subCategoryId ?? null,
        subChildCategoryId: dto.subChildCategoryId ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return {
        success: true,
        message: "Product created successfully",
        data: newProduct,
      };

    } catch (err) {
      console.error("Error in createProduct:", err);

      if (
        err instanceof BadRequestException ||
        err instanceof ConflictException ||
        err instanceof NotFoundException
      ) {
        throw err;
      }

      throw new HttpException(
        "Unexpected error while creating product",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async createProductVariant(dto: productVariantsDTO) {
    try {
      if (!dto.productId) {
        throw new BadRequestException("productId is required");
      }

      const product = await this.productModel.findById(dto.productId);
      if (!product) {
        throw new NotFoundException("Product not found");
      }

      if (!dto.salePrice) {
        throw new BadRequestException("Variant sale price is required");
      }
      if (!dto.offerPrice) {
        throw new BadRequestException("Variant offer price is required");
      }
      if (!dto.stock) {
        throw new BadRequestException("Variant stock is required");
      }

      const createdVariant = await this.productVarientsModel.create({
        productId: dto.productId,
        salePrice: dto.salePrice,
        offerPrice: dto.offerPrice || 0,
        stock: dto.stock,
        variantSku: dto.variantSku || null,
        variantName: dto.variantName.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return {
        success: true,
        message: "Product variant created successfully",
        data: createdVariant,
      };

    } catch (err) {
      console.error("Error in createProductVariant:", err);

      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException
      ) {
        throw err;
      }

      throw new HttpException(
        "Unexpected error occurred while creating product variant",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async createVariantAttributeValue(dto: VariantAttributeValuesDTO) {
    try {
      const { productVariantId, attributes } = dto;

      if (!productVariantId)
        throw new BadRequestException("productVariantId is required");

      if (!Array.isArray(attributes) || attributes.length === 0)
        throw new BadRequestException("attributes array is required");

      const variantExists = await this.productVarientsModel.findById(productVariantId);
      if (!variantExists)
        throw new NotFoundException("Product Variant not found");

      const results = [];

      for (const item of attributes) {
        const { attributeId, attributeValuesId } = item;

        if (!attributeId) throw new BadRequestException("attributeId is required");
        if (!attributeValuesId) throw new BadRequestException("attributeValuesId is required");

        const duplicate = await this.variantAttributeValuesModel.findOne({
          productVariantId,
          attributeId,
          attributeValuesId
        });

        if (duplicate) continue;
        const created = await this.variantAttributeValuesModel.create({
          productVariantId,
          attributeId,
          attributeValuesId,
          createdAt: new Date(),
          updatedAt: new Date()
        });


        const populated = await this.variantAttributeValuesModel
          .findById(created._id)
          .populate("productVariantId", "price stock variantSku")
          .populate("attributeId", "attributename")
          .populate("attributeValuesId", "value")
          .lean();

        results.push(populated);
      }

      return {
        success: true,
        message: "Variant attributes added successfully",
        data: results,
      };

    } catch (err) {
      console.error("Error in createVariantAttributeValue:", err);
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createVariantImages(productVariantId: string, imageUrls: string[]) {
    try {
      const variant = await this.productVarientsModel.findById(productVariantId);
      if (!variant) {
        throw new NotFoundException("Product variant not found");
      }

      const docs = imageUrls.map(url => ({
        productVariantId,
        imageUrl: url,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      const created = await this.variantImageModel.insertMany(docs);

      return {
        success: true,
        message: "Variant images uploaded successfully",
        data: created
      };

    } catch (err) {
      console.error("Error in createVariantImages:", err);
      throw new HttpException(
        err.message || "Failed to upload images",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  // async createFullProduct(dto: CreateFullProductDTO) {
  //   try {
  //     if (!dto.productName?.trim()) {
  //       throw new BadRequestException("Product name is required");
  //     }

  //     if (!Array.isArray(dto.variants) || dto.variants.length === 0) {
  //       throw new BadRequestException("At least one variant is required");
  //     }
  //     const categoryIds = [
  //       dto.mainCategoryId,
  //       dto.subCategoryId,
  //       dto.subChildCategoryId
  //     ].filter(Boolean);

  //     if (categoryIds.length) {
  //       const categoryCount = await this.inventoryCategoryModel.countDocuments({
  //         _id: { $in: categoryIds }
  //       });

  //       if (categoryCount !== categoryIds.length) {
  //         throw new BadRequestException("Invalid category id(s)");
  //       }
  //     }

  //     const exists = await this.productModel.findOne({
  //       productName: dto.productName.trim(),
  //       mainCategoryId: dto.mainCategoryId ?? null,
  //       subCategoryId: dto.subCategoryId ?? null,
  //       subChildCategoryId: dto.subChildCategoryId ?? null,
  //     });

  //     if (exists) {
  //       throw new ConflictException(
  //         "Product already exists in this category"
  //       );
  //     }

  //     const attributeIds = new Set<string>();
  //     const attributeValuePairs: { attributeId: string; valueId: string }[] = [];

  //     dto.variants.forEach(v => {
  //       v.attributes?.forEach(a => {
  //         attributeIds.add(a.attributeId);
  //         attributeValuePairs.push({
  //           attributeId: a.attributeId,
  //           valueId: a.attributeValuesId
  //         });
  //       });
  //     });

  //     if (attributeIds.size) {
  //       const validAttrCount = await this.attributesModel.countDocuments({
  //         _id: { $in: [...attributeIds] }
  //       });

  //       if (validAttrCount !== attributeIds.size) {
  //         throw new BadRequestException("Invalid attributeId found");
  //       }
  //     }

  //     for (const pair of attributeValuePairs) {
  //       const valid = await this.attributesValuesModel.exists({
  //         _id: pair.valueId,
  //         attributeId: pair.attributeId
  //       });

  //       if (!valid) {
  //         throw new BadRequestException(
  //           `Invalid attribute value ${pair.valueId} for attribute ${pair.attributeId}`
  //         );
  //       }
  //     }
  //     const product = await this.productModel.create({
  //       productName: dto.productName.trim(),
  //       description: dto.description ?? "",
  //       price: dto.price ?? "",
  //       sku: dto.sku,
  //       mainCategoryId: dto.mainCategoryId ?? null,
  //       subCategoryId: dto.subCategoryId ?? null,
  //       subChildCategoryId: dto.subChildCategoryId ?? null,
  //     });

  //     const variants = await this.productVarientsModel.insertMany(
  //       dto.variants.map(v => ({
  //         productId: product._id,
  //         variantName: v.variantName,
  //         price: v.price,
  //         stock: v.stock,
  //         variantSku: v.variantSku,
  //       }))
  //     );

  //     const attributeDocs = [];
  //     const imageDocs = [];

  //     variants.forEach((variant, index) => {
  //       const input = dto.variants[index];

  //       input.attributes?.forEach(a => {
  //         attributeDocs.push({
  //           productVariantId: variant._id,
  //           attributeId: a.attributeId,
  //           attributeValuesId: a.attributeValuesId,
  //         });
  //       });

  //       input.images?.forEach(url => {
  //         imageDocs.push({
  //           productVariantId: variant._id,
  //           imageUrl: url,
  //         });
  //       });
  //     });

  //     const attributes = attributeDocs.length
  //       ? await this.variantAttributeValuesModel.insertMany(attributeDocs)
  //       : [];

  //     const images = imageDocs.length
  //       ? await this.variantImageModel.insertMany(imageDocs)
  //       : [];
  //     return {
  //       success: true,
  //       message: "Product created successfully",
  //       data: {
  //         product,
  //         variants: variants.map(v => ({
  //           variant: v,
  //           attributes: attributes.filter(
  //             a => String(a.productVariantId) === String(v._id)
  //           ),
  //           images: images.filter(
  //             i => String(i.productVariantId) === String(v._id)
  //           ),
  //         }))
  //       }
  //     };

  //   } catch (err) {
  //     console.error("createFullProduct error:", err);
  //     throw err instanceof HttpException
  //       ? err
  //       : new HttpException(
  //         err.message || "Failed to create product",
  //         HttpStatus.INTERNAL_SERVER_ERROR
  //       );
  //   }
  // }

  async createFullProduct(dto: CreateFullProductDTO) {
    try {
      if (!dto.productName?.trim()) {
        throw new BadRequestException("Product name is required");
      }

      if (!Array.isArray(dto.variants) || dto.variants.length === 0) {
        throw new BadRequestException("At least one variant is required");
      }


      const categoryIds = [
        dto.mainCategoryId,
        dto.subCategoryId,
        dto.subChildCategoryId,
      ].filter(Boolean);

      if (categoryIds.length) {
        const count = await this.inventoryCategoryModel.countDocuments({
          _id: { $in: categoryIds },
        });

        if (count !== categoryIds.length) {
          throw new BadRequestException("Invalid category id(s)");
        }
      }


      const exists = await this.productModel.exists({
        productName: dto.productName.trim(),
        mainCategoryId: dto.mainCategoryId ?? null,
        subCategoryId: dto.subCategoryId ?? null,
        subChildCategoryId: dto.subChildCategoryId ?? null,
      });

      if (exists) {
        throw new ConflictException("Product already exists in this category");
      }


      const attributeIds = new Set<string>();
      const attributeValuePairs: { attributeId: string; valueId: string }[] = [];

      for (const variant of dto.variants) {
        for (const attr of variant.attributes ?? []) {
          attributeIds.add(attr.attributeId);
          attributeValuePairs.push({
            attributeId: attr.attributeId,
            valueId: attr.attributeValuesId,
          });
        }
      }

      if (attributeIds.size) {
        const validAttrCount = await this.attributesModel.countDocuments({
          _id: { $in: [...attributeIds] },
        });

        if (validAttrCount !== attributeIds.size) {
          throw new BadRequestException("Invalid attributeId found");
        }
      }

      if (attributeValuePairs.length) {
        const invalidValue = await this.attributesValuesModel.findOne({
          $or: attributeValuePairs.map(p => ({
            _id: p.valueId,
            attributeId: { $ne: p.attributeId },
          })),
        });

        if (invalidValue) {
          throw new BadRequestException("Invalid attribute value mapping");
        }
      }


      const product = await this.productModel.create({
        productName: dto.productName.trim(),
        sku: dto.sku,
        description: dto.description ?? "",
        price: dto.price ?? "",
        brand: dto.brand,
        about: dto.about,
        rating: dto.rating ?? 0,
        discount: dto.discount,
        offer: dto.offer,
        mainCategoryId: dto.mainCategoryId ?? null,
        subCategoryId: dto.subCategoryId ?? null,
        subChildCategoryId: dto.subChildCategoryId ?? null,
      });

      const variants = await this.productVarientsModel.insertMany(
        dto.variants.map(v => ({
          productId: product._id,
          variantName: v.variantName,
          stock: v.stock,
          salePrice: v.salePrice,
          offerPrice: v.offerPrice,
          variantSku: v.variantSku,
        }))
      );

      const attributeDocs = [];
      const imageDocs = [];

      variants.forEach((variant, index) => {
        const input = dto.variants[index];

        for (const attr of input.attributes ?? []) {
          attributeDocs.push({
            productVariantId: variant._id,
            attributeId: attr.attributeId,
            attributeValuesId: attr.attributeValuesId,
          });
        }

        for (const img of input.images ?? []) {
          imageDocs.push({
            productVariantId: variant._id,
            imageUrl: img,
          });
        }
      });

      const [attributes, images] = await Promise.all([
        attributeDocs.length
          ? this.variantAttributeValuesModel.insertMany(attributeDocs)
          : [],
        imageDocs.length
          ? this.variantImageModel.insertMany(imageDocs)
          : [],
      ]);


      return {
        success: true,
        message: "Product created successfully",
        // data: {
        //   product,
        //   variants: variants.map(v => ({
        //     variant: v,
        //     attributes: attributes.filter(
        //       a => String(a.productVariantId) === String(v._id)
        //     ),
        //     images: images.filter(
        //       i => String(i.productVariantId) === String(v._id)
        //     ),
        //   })),
        // },
      };

    } catch (err) {
      console.error("createFullProduct error:", err);
      throw err instanceof HttpException
        ? err
        : new HttpException(
          err.message || "Failed to create product",
          HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
  }






  async updateProduct(id: string, dto: productDTO) {
    try {

      const product = await this.productModel.findById(id);
      if (!product) {
        throw new NotFoundException("Product not found");
      }

      if (dto.productName !== undefined) {
        if (!dto.productName.trim()) {
          throw new BadRequestException("Product name cannot be empty");
        }
        product.productName = dto.productName.trim();
      }


      if (dto.price !== undefined) product.price = dto.price;
      if (dto.description !== undefined) product.description = dto.description;


      if (dto.mainCategoryId) {
        const exists = await this.inventoryCategoryModel.findById(dto.mainCategoryId);
        if (!exists) throw new NotFoundException("Main category not found");

        product.mainCategoryId = dto.mainCategoryId;
      }

      if (dto.subCategoryId) {
        const exists = await this.inventoryCategoryModel.findById(dto.subCategoryId);
        if (!exists) throw new NotFoundException("Sub category not found");

        product.subCategoryId = dto.subCategoryId;
      }

      if (dto.subChildCategoryId) {
        const exists = await this.inventoryCategoryModel.findById(dto.subChildCategoryId);
        if (!exists) throw new NotFoundException("Sub-child category not found");

        product.subChildCategoryId = dto.subChildCategoryId;
      }

      if (dto.sku !== undefined) {
        product.sku = dto.sku;
      }

      product.updatedAt = new Date();

      await product.save();

      return {
        success: true,
        message: "Product updated successfully",
        data: product,
      };

    } catch (err) {
      console.error("Error in updateProduct:", err);

      if (
        err instanceof BadRequestException ||
        err instanceof ConflictException ||
        err instanceof NotFoundException
      ) {
        throw err;
      }

      throw new HttpException(
        "Unexpected error while updating product",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateProductVariant(id: string, dto: productVariantsDTO) {
    try {
      const variant = await this.productVarientsModel.findById(id);
      if (!variant) {
        throw new NotFoundException("Product variant not found");
      }

      if (dto.productId && dto.productId !== variant.productId) {
        const productExists = await this.productModel.findById(dto.productId);
        if (!productExists) {
          throw new NotFoundException("Product not found");
        }
        variant.productId = dto.productId;
      }

      if (dto.salePrice !== undefined) {
        variant.salePrice = dto.salePrice;
      }

      if (dto.offerPrice !== undefined) {
        variant.offerPrice = dto.offerPrice;
      }

      if (dto.stock !== undefined) {
        variant.stock = dto.stock;
      }

      if (dto.variantName !== undefined) {
        variant.variantName = dto.variantName.trim();
      }

      if (dto.variantSku !== undefined) {
        variant.variantSku = dto.variantSku;
      }

      variant.updatedAt = new Date();

      await variant.save();

      return {
        success: true,
        message: "Product variant updated successfully",
        data: variant
      };

    } catch (err) {
      console.error("Error in updateProductVariant:", err);

      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException
      ) {
        throw err;
      }

      throw new HttpException(
        "Failed to update product variant",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateAttribute(id: string, dto: attributesDTO) {
    try {
      if (!id) {
        throw new BadRequestException("Attribute ID is required");
      }

      if (!dto.attributename?.trim()) {
        throw new BadRequestException("Attribute name is required");
      }

      const name = dto.attributename.trim();

      const existing = await this.attributesModel.findById(id);
      if (!existing) {
        throw new NotFoundException("Attribute not found");
      }

      const duplicate = await this.attributesModel.findOne({
        _id: { $ne: id },
        attributename: name
      }).lean();


      if (duplicate) {
        throw new ConflictException("Another attribute with this attributename already exists");
      }

      existing.attributename = name;
      existing.updatedAt = new Date();

      await existing.save();

      return {
        success: true,
        message: "Attribute updated successfully",
        data: existing
      };

    } catch (err) {
      console.error("Error in updateAttribute:", err);

      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException ||
        err instanceof ConflictException
      ) {
        throw err;
      }

      throw new HttpException(
        "Unexpected error while updating attribute",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateAttributeValue(id: string, dto: attributesValuesDTO) {
    try {
      if (!id) {
        throw new BadRequestException("Attribute Value ID is required");
      }

      if (!dto.attributeId) {
        throw new BadRequestException("attributeId is required");
      }

      if (!dto.value?.trim()) {
        throw new BadRequestException("Value is required");
      }

      const value = dto.value.trim();

      const existing = await this.attributesValuesModel.findById(id);
      if (!existing) {
        throw new NotFoundException("Attribute value not found");
      }

      const attributeExists = await this.attributesModel.findById(dto.attributeId);
      if (!attributeExists) {
        throw new NotFoundException("Attribute not found");
      }

      const duplicate = await this.attributesValuesModel.findOne({
        _id: { $ne: id },
        attributeId: dto.attributeId,
        value
      }).lean();

      if (duplicate) {
        throw new ConflictException("Another value already exists for this attribute");
      }

      existing.attributeId = dto.attributeId;
      existing.value = value;
      existing.updatedAt = new Date();

      await existing.save();

      return {
        success: true,
        message: "Attribute value updated successfully",
        data: existing
      };

    } catch (err) {
      console.error("Error in updateAttributeValue:", err);

      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException ||
        err instanceof ConflictException
      ) {
        throw err;
      }

      throw new HttpException(
        "Unexpected error while updating attribute value",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateInventoryCategory(id: string,
    dto: inventoryCategoryDTO,
    imageUrl?: string
  ) {

    const updateData: any = {
      categoryName: dto.categoryName,
      level: dto.level,
      parentId: dto.parentId || null,
      updatedAt: new Date(),
    };

    if (imageUrl) {
      updateData.imageUrl = imageUrl;
    }

    const updated = await this.inventoryCategoryModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    return {
      success: true,
      message: "Category updated successfully",
      data: updated,
    };
  }


  async updateVariantAttributeValue(productVariantId: string, dto: VariantAttributeValuesDTO) {
    try {
      const { attributes } = dto;

      if (!Array.isArray(attributes) || attributes.length === 0) {
        throw new BadRequestException("attributes array is required");
      }

      const variantExists = await this.productVarientsModel.findById(productVariantId);
      if (!variantExists) {
        throw new NotFoundException("Product Variant not found");
      }

      await this.variantAttributeValuesModel.deleteMany({ productVariantId });

      const results = [];

      for (const item of attributes) {
        const created = await this.variantAttributeValuesModel.create({
          productVariantId,
          attributeId: item.attributeId,
          attributeValuesId: item.attributeValuesId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const populated = await this.variantAttributeValuesModel
          .findById(created._id)
          .populate("attributeId", "attributename")
          .populate("attributeValuesId", "value")
          .lean();

        results.push(populated);
      }

      return {
        success: true,
        message: "Variant attributes updated successfully",
        data: results,
      };

    } catch (err) {
      console.error("Error in updateVariantAttributeValue:", err);
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateVariantImages(productVariantId: string, imageUrls: string[]) {
    try {
      const variant = await this.productVarientsModel.findById(productVariantId);
      if (!variant) {
        throw new NotFoundException("Product variant not found");
      }

      await this.variantImageModel.deleteMany({ productVariantId });

      const docs = imageUrls.map(url => ({
        productVariantId,
        imageUrl: url,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      const saved = await this.variantImageModel.insertMany(docs);

      return {
        success: true,
        message: "Variant images updated successfully",
        data: saved
      };

    } catch (err) {
      console.error("Error in updateVariantImages:", err);
      throw new HttpException(
        err.message || "Failed to update variant images",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // async updateFullProduct(productId: string, dto: CreateFullProductDTO) {
  //   try {
  //     const product = await this.productModel.findById(productId);
  //     if (!product) {
  //       throw new NotFoundException("Product not found");
  //     }

  //     if (!dto.productName?.trim()) {
  //       throw new BadRequestException("Product name is required");
  //     }

  //     if (!Array.isArray(dto.variants) || dto.variants.length === 0) {
  //       throw new BadRequestException("At least one variant is required");
  //     }

  //     const categoryIds = [
  //       dto.mainCategoryId,
  //       dto.subCategoryId,
  //       dto.subChildCategoryId
  //     ].filter(Boolean);

  //     if (categoryIds.length) {
  //       const count = await this.inventoryCategoryModel.countDocuments({
  //         _id: { $in: categoryIds }
  //       });

  //       if (count !== categoryIds.length) {
  //         throw new BadRequestException("Invalid category id(s)");
  //       }
  //     }
  //     product.mainCategoryId = this.asId(dto.mainCategoryId);
  //     product.subCategoryId = this.asId(dto.subCategoryId);
  //     product.subChildCategoryId = this.asId(dto.subChildCategoryId);

  //     product.productName = dto.productName.trim();
  //     product.description = dto.description ?? "";
  //     product.price = dto.price ?? "";
  //     product.sku = dto.sku ?? product.sku;
  //     product.mainCategoryId = this.asId(dto.mainCategoryId);
  //     product.subCategoryId = this.asId(dto.subCategoryId);
  //     product.subChildCategoryId = this.asId(dto.subChildCategoryId);

  //     product.updatedAt = new Date();

  //     await product.save();


  //     const oldVariants = await this.productVarientsModel.find({
  //       productId
  //     }).lean();

  //     const variantIds = oldVariants.map(v => v._id);

  //     if (variantIds.length) {
  //       await this.variantAttributeValuesModel.deleteMany({
  //         productVariantId: { $in: variantIds }
  //       });

  //       await this.variantImageModel.deleteMany({
  //         productVariantId: { $in: variantIds }
  //       });

  //       await this.productVarientsModel.deleteMany({
  //         productId
  //       });
  //     }

  //     const newVariants = await this.productVarientsModel.insertMany(
  //       dto.variants.map(v => ({
  //         productId,
  //         variantName: v.variantName,
  //         price: v.price,
  //         stock: v.stock,
  //         variantSku: v.variantSku,
  //         createdAt: new Date(),
  //         updatedAt: new Date()
  //       }))
  //     );


  //     const attributeDocs = [];
  //     const imageDocs = [];

  //     newVariants.forEach((variant, index) => {
  //       const input = dto.variants[index];

  //       input.attributes?.forEach(a => {
  //         attributeDocs.push({
  //           productVariantId: variant._id,
  //           attributeId: a.attributeId,
  //           attributeValuesId: a.attributeValuesId,
  //           createdAt: new Date(),
  //           updatedAt: new Date()
  //         });
  //       });

  //       input.images?.forEach(url => {
  //         imageDocs.push({
  //           productVariantId: variant._id,
  //           imageUrl: url,
  //           createdAt: new Date(),
  //           updatedAt: new Date()
  //         });
  //       });
  //     });

  //     const attributes = attributeDocs.length
  //       ? await this.variantAttributeValuesModel.insertMany(attributeDocs)
  //       : [];

  //     const images = imageDocs.length
  //       ? await this.variantImageModel.insertMany(imageDocs)
  //       : [];


  //     return {
  //       success: true,
  //       message: "Product updated successfully",
  //       data: {
  //         product,
  //         variants: newVariants.map(v => ({
  //           variant: v,
  //           attributes: attributes.filter(
  //             a => String(a.productVariantId) === String(v._id)
  //           ),
  //           images: images.filter(
  //             i => String(i.productVariantId) === String(v._id)
  //           ),
  //         }))
  //       }
  //     };

  //   } catch (err) {
  //     console.error("updateFullProduct error:", err);
  //     throw err instanceof HttpException
  //       ? err
  //       : new HttpException(
  //         err.message || "Failed to update product",
  //         HttpStatus.INTERNAL_SERVER_ERROR
  //       );
  //   }
  // }
  async updateFullProduct(productId: string, dto: CreateFullProductDTO) {
    try {
      const product = await this.productModel.findById(productId);
      if (!product) {
        throw new NotFoundException("Product not found");
      }

      if (!dto.productName?.trim()) {
        throw new BadRequestException("Product name is required");
      }

      if (!Array.isArray(dto.variants) || dto.variants.length === 0) {
        throw new BadRequestException("At least one variant is required");
      }

      const categoryIds = [
        dto.mainCategoryId,
        dto.subCategoryId,
        dto.subChildCategoryId,
      ].filter(Boolean);

      if (categoryIds.length) {
        const count = await this.inventoryCategoryModel.countDocuments({
          _id: { $in: categoryIds },
        });

        if (count !== categoryIds.length) {
          throw new BadRequestException("Invalid category id(s)");
        }
      }

      Object.assign(product, {
        productName: dto.productName.trim(),
        description: dto.description ?? "",
        price: dto.price ?? "",
        sku: dto.sku ?? product.sku,
        brand: dto.brand,
        about: dto.about,
        rating: dto.rating ?? product.rating,
        discount: dto.discount,
        offer: dto.offer,
        mainCategoryId: this.asId(dto.mainCategoryId),
        subCategoryId: this.asId(dto.subCategoryId),
        subChildCategoryId: this.asId(dto.subChildCategoryId),
        updatedAt: new Date(),
      });

      await product.save();

      const oldVariants = await this.productVarientsModel
        .find({ productId })
        .select("_id")
        .lean();

      const variantIds = oldVariants.map(v => v._id);

      if (variantIds.length) {
        await Promise.all([
          this.variantAttributeValuesModel.deleteMany({
            productVariantId: { $in: variantIds },
          }),
          this.variantImageModel.deleteMany({
            productVariantId: { $in: variantIds },
          }),
          this.productVarientsModel.deleteMany({ productId }),
        ]);
      }
      const newVariants = await this.productVarientsModel.insertMany(
        dto.variants.map(v => ({
          productId,
          variantName: v.variantName,
          stock: v.stock,
          salePrice: v.salePrice,
          offerPrice: v.offerPrice,
          variantSku: v.variantSku,
        }))
      );
      const attributeDocs = [];
      const imageDocs = [];

      newVariants.forEach((variant, index) => {
        const input = dto.variants[index];

        for (const attr of input.attributes ?? []) {
          attributeDocs.push({
            productVariantId: variant._id,
            attributeId: attr.attributeId,
            attributeValuesId: attr.attributeValuesId,
          });
        }

        for (const img of input.images ?? []) {
          imageDocs.push({
            productVariantId: variant._id,
            imageUrl: img,
          });
        }
      });

      const [attributes, images] = await Promise.all([
        attributeDocs.length
          ? this.variantAttributeValuesModel.insertMany(attributeDocs)
          : [],
        imageDocs.length
          ? this.variantImageModel.insertMany(imageDocs)
          : [],
      ]);
      return {
        success: true,
        message: "Product updated successfully",
        // data: {
        //   product,
        //   variants: newVariants.map(v => ({
        //     variant: v,
        //     attributes: attributes.filter(
        //       a => String(a.productVariantId) === String(v._id)
        //     ),
        //     images: images.filter(
        //       i => String(i.productVariantId) === String(v._id)
        //     ),
        //   })),
        // },
      };

    } catch (err) {
      console.error("updateFullProduct error:", err);
      throw err instanceof HttpException
        ? err
        : new HttpException(
          err.message || "Failed to update product",
          HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
  }





  async upsertAttribute(dto: any) {
    if (dto.id) {
      return this.updateAttribute(dto.id, dto);
    }
    return this.createAttribute(dto);
  }

  async upsertAttributeValue(dto: any) {
    if (dto.id) {
      return this.updateAttributeValue(dto.id, dto);
    }
    return this.createAttributeValue(dto);
  }

  async upsertInventoryCategory(
    dto: inventoryCategoryDTO & { id?: string },
    imageUrl?: string
  ) {
    if (dto.id) {
      // Update case
      return this.updateInventoryCategory(dto.id, dto, imageUrl);
    }

    if (!imageUrl) {
      throw new BadRequestException("Category image is required");
    }

    // Create case
    return this.createInventoryCategory(dto, imageUrl);
  }

  async upsertProduct(dto: productDTO & { id?: string }) {
    if (dto.id) {
      return this.updateProduct(dto.id, dto);
    }
    return this.createProduct(dto);
  }

  async upsertProductVariant(dto: productVariantsDTO & { id?: string }) {
    if (dto.id) {
      return this.updateProductVariant(dto.id, dto);
    }
    return this.createProductVariant(dto);
  }

  async upsertProductVariantWithAttributes(dto: productVariantsDTO & { id?: string }) {

    const variantResult = dto.id
      ? await this.updateProductVariant(dto.id, dto)
      : await this.createProductVariant(dto);

    const variantId = variantResult.data._id;

    if (dto.attributes && dto.attributes.length > 0) {
      await this.upsertVariantAttributeValues({
        productVariantId: variantId,
        attributes: dto.attributes
      });
    }

    return {
      success: true,
      message: "Product variant saved successfully",
      data: variantResult.data
    };
  }

  async upsertVariantAttributeValues(dto: VariantAttributeValuesDTO) {
    try {
      const { productVariantId, attributes } = dto;

      if (!productVariantId) {
        throw new BadRequestException("productVariantId is required");
      }

      if (!Array.isArray(attributes) || attributes.length === 0) {
        throw new BadRequestException("attributes array is required");
      }

      const variantExists = await this.productVarientsModel.findById(productVariantId);
      if (!variantExists) {
        throw new NotFoundException("Product Variant not found");
      }

      for (const item of attributes) {
        if (!item.attributeId) {
          throw new BadRequestException("attributeId is required");
        }
        if (!item.attributeValuesId) {
          throw new BadRequestException("attributeValuesId is required");
        }

        const validValue = await this.attributesValuesModel.exists({
          _id: item.attributeValuesId,
          attributeId: item.attributeId,
        });

        if (!validValue) {
          throw new BadRequestException(
            `Invalid attributeValuesId ${item.attributeValuesId} for attribute ${item.attributeId}`
          );
        }
      }

      await this.variantAttributeValuesModel.deleteMany({ productVariantId });
      const createdDocs = await this.variantAttributeValuesModel.insertMany(
        attributes.map(a => ({
          productVariantId,
          attributeId: a.attributeId,
          attributeValuesId: a.attributeValuesId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
      );

      const populated = await this.variantAttributeValuesModel
        .find({ _id: { $in: createdDocs.map(d => d._id) } })
        .populate("attributeId", "attributename")
        .populate("attributeValuesId", "value")
        .lean();

      return {
        success: true,
        message: "Variant attributes upserted successfully",
        data: populated,
      };

    } catch (err) {
      console.error("Error in upsertVariantAttributeValues:", err);

      throw err instanceof HttpException
        ? err
        : new HttpException(
          err.message || "Failed to upsert variant attributes",
          HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
  }



  async getAllAttributes(query: any) {
    try {
      const { page, limit, skip } = this.paginate(query);
      const search = query.search?.trim() || "";

      const filter: any = {};

      if (search) {
        filter.attributename = { $regex: search, $options: "i" };
      }

      const [list, total] = await Promise.all([
        this.attributesModel
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),

        this.attributesModel.countDocuments(filter),
      ]);

      return {
        success: true,
        message: "Attributes fetched successfully",
        data: list,
        total,
        page,
        limit,
      };

    } catch (err) {
      console.error("Error in getAllAttributes:", err);
      throw new HttpException("Failed to fetch attributes", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllInventoryCategories(query: any) {
    try {
      const { page, limit, skip } = this.paginate(query);
      const search = query.search?.trim() || "";
      const level = query.level?.trim() || "";

      const filter: any = {};

      if (search) {
        filter.categoryName = { $regex: search, $options: "i" };
      }

      // 🎯 Filter by Level (MAIN / SUB / SUBCHILD)
      if (level) {
        filter.level = level;
      }
      const parentId = query.parentId?.trim() || "";

      if (parentId) {
        filter.parentId = parentId;
      }


      const [list, total] = await Promise.all([
        this.inventoryCategoryModel
          .find(filter)
          .populate("parentId", "categoryName level")
          .skip(skip)
          .limit(limit)
          .lean(),

        this.inventoryCategoryModel.countDocuments(filter),
      ]);

      const finalData = list.map(cat => ({
        _id: cat._id,
        categoryName: cat.categoryName,
        level: cat.level,
        imageUrl: cat.imageUrl || null,
        parentId: cat.parentId?._id || null,
        parentCategoryName: cat.parentId?.categoryName || null,
        parentCategoryLevel: cat.parentId?.level || null,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt
      }));

      return {
        success: true,
        message: "Categories fetched successfully",
        data: finalData,
        total,
        page,
        limit,
      };

    } catch (err) {
      console.error("Error in getAllInventoryCategories:", err);
      throw new HttpException(
        "Failed to fetch categories",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getAllProductVariants(query: any) {
    try {
      const page = Number(query.page) > 0 ? Number(query.page) : 1;
      const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
      const skip = (page - 1) * limit;
      const search = query.search?.trim() || "";

      const filter: any = {};

      if (search) {
        filter.$or = [
          { variantSku: { $regex: search, $options: "i" } },
          { price: { $regex: search, $options: "i" } },
          { stock: { $regex: search, $options: "i" } }
        ];
      }

      const [variants, total] = await Promise.all([
        this.productVarientsModel.find(filter).skip(skip).limit(limit).lean(),
        this.productVarientsModel.countDocuments(filter)
      ]);

      if (!variants.length) {
        return {
          success: true,
          message: "No product variants found",
          data: [],
          total,
          page,
          limit
        };
      }

      const variantIds = variants.map(v => v._id.toString());

      const allAttributes = await this.variantAttributeValuesModel
        .find({ productVariantId: { $in: variantIds } })
        .populate("attributeId", "attributename")
        .populate("attributeValuesId", "value")
        .lean();

      const allImages = await this.variantImageModel
        .find({ productVariantId: { $in: variantIds } })
        .lean();

      const productIds = [...new Set(variants.map(v => v.productId))];

      const products = await this.productModel
        .find({ _id: { $in: productIds } })
        .populate("mainCategoryId", "categoryName")
        .populate("subCategoryId", "categoryName")
        .populate("subChildCategoryId", "categoryName")
        .lean();

      const productMap: any = {};
      products.forEach(p => (productMap[p._id] = p));

      const finalData = variants.map(v => {
        const vid = String(v._id);
        const product = productMap[v.productId] || {};

        const attrs = allAttributes.filter(
          a => String(a.productVariantId) === vid
        );

        return {
          ...v,

          productName: product.productName || null,

          mainCategoryId: product.mainCategoryId?._id || null,
          mainCategoryName: product.mainCategoryId?.categoryName || null,

          subCategoryId: product.subCategoryId?._id || null,
          subCategoryName: product.subCategoryId?.categoryName || null,

          subChildCategoryId: product.subChildCategoryId?._id || null,
          subChildCategoryName: product.subChildCategoryId?.categoryName || null,

          attributeName: attrs
            .map(a => a.attributeId?.attributename)
            .filter(Boolean)
            .join(", "),
          attributeValue: attrs
            .map(a => a.attributeValuesId?.value)
            .filter(Boolean)
            .join(", "),

          attributes: attrs.map(a => ({
            attributeId: a.attributeId?._id,
            attributeValuesId: a.attributeValuesId?._id
          })),

          images: allImages.filter(
            img => String(img.productVariantId) === vid
          )
        };

      });

      return {
        success: true,
        message: "Product variants fetched successfully",
        data: finalData,
        total,
        page,
        limit
      };

    } catch (err) {
      console.error("Error in getAllProductVariants:", err);
      throw new HttpException(
        "Failed to fetch product variants",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getAllProducts(query: any) {
    try {
      let { page = 1, limit = 10, search = "", topSelling, category } = query;

      page = Number(page) > 0 ? Number(page) : 1;
      limit = Number(limit) > 0 ? Number(limit) : 10;
      const skip = (page - 1) * limit;

      const filter: any = {
        isActive: true,
        isDeleted: false,
      };

      // ✅ Combined search + category logic
      const orConditions: any[] = [];

      if (search?.trim()) {
        const searchRegex = new RegExp(search.trim(), "i");

        orConditions.push({ productName: searchRegex });

        const matchedCategories = await this.inventoryCategoryModel
          .find({ categoryName: searchRegex })
          .select("_id")
          .lean();

        const categoryIds = matchedCategories.map(c => c._id);

        if (categoryIds.length) {
          orConditions.push(
            { mainCategoryId: { $in: categoryIds } },
            { subCategoryId: { $in: categoryIds } },
            { subChildCategoryId: { $in: categoryIds } }
          );
        }
      }

      if (category?.trim()) {
        const categoryRegex = new RegExp(category.trim(), "i");

        const matchedCategories = await this.inventoryCategoryModel
          .find({ categoryName: categoryRegex })
          .select("_id")
          .lean();

        const categoryIds = matchedCategories.map(c => c._id);

        if (categoryIds.length) {
          orConditions.push(
            { mainCategoryId: { $in: categoryIds } },
            { subCategoryId: { $in: categoryIds } },
            { subChildCategoryId: { $in: categoryIds } }
          );
        }
      }

      if (orConditions.length) {
        filter.$or = orConditions;
      }

      const [products, total] = await Promise.all([
        this.productModel
          .find(filter)
          .populate("mainCategoryId", "categoryName level")
          .populate("subCategoryId", "categoryName level")
          .populate("subChildCategoryId", "categoryName level")
          .sort({ createdAt: -1 }) // default sorting
          .lean(),

        this.productModel.countDocuments(filter),
      ]);

      const productIds = products.map(p => p._id);

      const variants = await this.productVarientsModel
        .find({
          productId: { $in: productIds },
          isActive: true,
          isDeleted: false,
        })
        .lean();

      const variantIds = variants.map(v => v._id);

      const [attributes, images] = await Promise.all([
        this.variantAttributeValuesModel
          .find({ productVariantId: { $in: variantIds } })
          .populate("attributeId", "attributename")
          .populate("attributeValuesId", "value")
          .lean(),

        this.variantImageModel
          .find({ productVariantId: { $in: variantIds } })
          .lean(),
      ]);

      const attrMap = new Map<string, any[]>();
      attributes.forEach(a => {
        const key = String(a.productVariantId);
        if (!attrMap.has(key)) attrMap.set(key, []);
        attrMap.get(key)!.push(a);
      });

      const imageMap = new Map<string, string[]>();
      images.forEach(i => {
        const key = String(i.productVariantId);
        if (!imageMap.has(key)) imageMap.set(key, []);
        imageMap.get(key)!.push(i.imageUrl);
      });

      const variantMap = new Map<string, any[]>();
      variants.forEach(v => {
        const key = String(v.productId);
        if (!variantMap.has(key)) variantMap.set(key, []);
        variantMap.get(key)!.push(v);
      });

      let finalProducts = products.map(p => {
        const productVariants = variantMap.get(String(p._id)) || [];

        const totalStock = productVariants.reduce(
          (sum, v) => sum + Number(v.stock || 0),
          0
        );

        return {
          id: p._id,
          name: p.productName,
          brand: p.brand,
          description: p.description,
          about: p.about,
          rating: p.rating,
          discount: p.discount,
          offer: p.offer,
          created: p.createdAt,
          quantity: totalStock,
          isStock: totalStock > 0,
          inventoryCategories: [
            p.mainCategoryId && {
              id: p.mainCategoryId._id,
              name: p.mainCategoryId.categoryName,
              level: "MAIN",
            },
            p.subCategoryId && {
              id: p.subCategoryId._id,
              name: p.subCategoryId.categoryName,
              level: "SUB",
            },
            p.subChildCategoryId && {
              id: p.subChildCategoryId._id,
              name: p.subChildCategoryId.categoryName,
              level: "SUBCHILD",
            },
          ].filter(Boolean),
          variants: productVariants.map(v => ({
            variantId: v._id,
            variantName: v.variantName,
            stock: Number(v.stock),
            salePrice: v.salePrice,
            offerPrice: v.offerPrice,
            attributes: (attrMap.get(String(v._id)) || []).map(a => ({
              attributeId: a.attributeId?._id,
              attributeName: a.attributeId?.attributename,
              attributeValueId: a.attributeValuesId?._id,
              attributeValue: a.attributeValuesId?.value,
            })),
            images: imageMap.get(String(v._id)) || [],
          })),
        };
      });

      // 🔥 Top Selling: if param present → sort by quantity DESC
      if (topSelling !== undefined) {
        finalProducts = finalProducts.sort((a, b) => b.quantity - a.quantity);
      }

      // ✅ Pagination
      const paginatedProducts = finalProducts.slice(skip, skip + limit);

      return {
        success: true,
        message: "Products fetched successfully",
        data: paginatedProducts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };

    } catch (err) {
      console.error("Error in getAllFullProductsDetails:", err);
      throw new HttpException(
        "Failed to fetch products",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // async getAllProducts(query: any) {
  //   try {
  //     let {
  //       page = 1,
  //       limit = 10,
  //       search = "",
  //       mainCategoryId,
  //       subCategoryId,
  //       subChildCategoryId,
  //     } = query;

  //     page = Number(page) > 0 ? Number(page) : 1;
  //     limit = Number(limit) > 0 ? Number(limit) : 10;
  //     const skip = (page - 1) * limit;

  //     const filter: any = {
  //       isActive: true,
  //       isDeleted: false,
  //     };

  //     if (search.trim()) {
  //       const searchRegex = new RegExp(search.trim(), "i");

  //       const matchedCategories = await this.inventoryCategoryModel
  //         .find({ categoryName: searchRegex })
  //         .select("_id")
  //         .lean();

  //       const categoryIds = matchedCategories.map(c => c._id);

  //       const orConditions: any[] = [
  //         { productName: searchRegex },
  //       ];

  //       if (categoryIds.length > 0) {
  //         orConditions.push(
  //           { mainCategoryId: { $in: categoryIds } },
  //           { subCategoryId: { $in: categoryIds } },
  //           { subChildCategoryId: { $in: categoryIds } }
  //         );
  //       }

  //       filter.$or = orConditions;
  //     }
  //     if (mainCategoryId) filter.mainCategoryId = mainCategoryId;
  //     if (subCategoryId) filter.subCategoryId = subCategoryId;
  //     if (subChildCategoryId) filter.subChildCategoryId = subChildCategoryId;

  //     /* -------------------- QUERY + COUNT (SAME FILTER) -------------------- */
  //     const [products, total] = await Promise.all([
  //       this.productModel
  //         .find(filter)
  //         .populate("mainCategoryId", "categoryName level")
  //         .populate("subCategoryId", "categoryName level")
  //         .populate("subChildCategoryId", "categoryName level")
  //         .skip(skip)
  //         .limit(limit)
  //         .sort({ createdAt: -1 })
  //         .lean(),

  //       this.productModel.countDocuments(filter),
  //     ]);

  //     const finalData = products.map(p => ({
  //       id: p._id,
  //       productName: p.productName,
  //       brand: p.brand,
  //       description: p.description,
  //       about: p.about,
  //       rating: p.rating,
  //       discount: p.discount,
  //       offer: p.offer,
  //       createdAt: p.createdAt,

  //       mainCategoryId: p.mainCategoryId?._id || null,
  //       mainCategoryName: p.mainCategoryId?.categoryName || null,

  //       subCategoryId: p.subCategoryId?._id || null,
  //       subCategoryName: p.subCategoryId?.categoryName || null,

  //       subChildCategoryId: p.subChildCategoryId?._id || null,
  //       subChildCategoryName: p.subChildCategoryId?.categoryName || null,
  //     }));

  //     return {
  //       success: true,
  //       message: "Products fetched successfully",
  //       data: finalData,
  //       pagination: {
  //         page,
  //         limit,
  //         total,
  //         totalPages: Math.ceil(total / limit),
  //       },
  //     };

  //   } catch (err) {
  //     console.error("Error in getAllProducts:", err);
  //     throw new HttpException(
  //       "Failed to fetch products",
  //       HttpStatus.INTERNAL_SERVER_ERROR
  //     );
  //   }
  // }

  async getAllAttributeValues(query: any) {
    try {
      const { page, limit, skip } = this.paginate(query);
      const search = query.search?.trim() || "";

      const filter: any = {};
      if (search) {
        filter.value = { $regex: search, $options: "i" };
      }

      const [list, total] = await Promise.all([
        this.attributesValuesModel
          .find(filter)
          .populate("attributeId", "attributename")
          .skip(skip)
          .limit(limit)
          .lean(),

        this.attributesValuesModel.countDocuments(filter),
      ]);

      const mappedList = list.map(item => ({
        ...item,
        attributename: item.attributeId?.attributename
      }));

      return {
        success: true,
        message: "Attribute values fetched successfully",
        data: mappedList,
        total,
        page,
        limit,
      };

    } catch (err) {
      console.error("Error in getAllAttributeValues:", err);
      throw new HttpException(
        "Failed to fetch attribute values",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getAllVariantAttributeValues(query: any) {
    try {
      const page = Number(query.page) > 0 ? Number(query.page) : 1;
      const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
      const skip = (page - 1) * limit;
      const search = query.search?.trim() || "";
      const productVariantId = query.productVariantId;

      const filter: any = {};

      if (productVariantId) {
        filter.productVariantId = productVariantId;
      }

      if (search) {
        filter.$or = [
          { attributename: { $regex: search, $options: "i" } },
          { attributeId: { $regex: search, $options: "i" } }
        ];
      }

      const [rawList, total] = await Promise.all([
        this.variantAttributeValuesModel
          .find(filter)
          .populate("attributeId", "attributename")
          .populate("attributeValuesId", "value")
          .populate("productVariantId", "price stock variantSku")
          .skip(skip)
          .limit(limit)
          .lean(),

        this.variantAttributeValuesModel.countDocuments(filter),
      ]);

      const list = rawList.map(item => ({
        _id: item._id,

        productVariantId: item.productVariantId?._id || null,
        productVariantSku: item.productVariantId?.variantSku || null,
        salePrice: item.productVariantId?.salePrice || null,
        offerPrice: item.productVariantId?.offerPrice || null,
        stock: item.productVariantId?.stock || null,

        attributeId: item.attributeId?._id || null,
        attributeName: item.attributeId?.attributename || null,

        attributeValueId: item.attributeValuesId?._id || null,
        attributeValue: item.attributeValuesId?.value || null,

        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }));

      return {
        success: true,
        message: "Variant attribute values fetched successfully",
        data: list,
        total,
        page,
        limit,
      };

    } catch (err) {
      console.error("Error in getAllVariantAttributeValues:", err);
      throw new HttpException(
        "Failed to fetch variant attribute values",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getAllVariantImages(query: any) {
    try {
      const page = Number(query.page) > 0 ? Number(query.page) : 1;
      const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
      const skip = (page - 1) * limit;
      const search = query.search?.trim() || "";
      const productVariantId = query.productVariantId;

      const filter: any = {};

      if (productVariantId) {
        filter.productVariantId = productVariantId;
      }

      if (search) {
        filter.imageUrl = { $regex: search, $options: "i" };
      }

      const [list, total] = await Promise.all([
        this.variantImageModel
          .find(filter)
          .populate("productVariantId", "price stock variantSku")
          .skip(skip)
          .limit(limit)
          .lean(),

        this.variantImageModel.countDocuments(filter),
      ]);

      return {
        success: true,
        message: "Variant images fetched successfully",
        data: list,
        total,
        page,
        limit,
      };

    } catch (err) {
      console.error("Error in getAllVariantImages:", err);

      throw new HttpException(
        "Failed to fetch variant images",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }







  async getAttributeValuesbyattributeid(attributeId: string | undefined, query: any) {
    try {
      const { page, limit, skip } = this.paginate(query);

      const filter: any = {};
      if (attributeId) filter.attributeId = attributeId;

      const [list, total] = await Promise.all([
        this.attributesValuesModel.find(filter).skip(skip).limit(limit).lean(),
        this.attributesValuesModel.countDocuments(filter),
      ]);

      return {
        success: true,
        message: 'Attribute values fetched successfully',
        data: list,
        total,
        page,
        limit,
      };

    } catch (err) {
      console.error('Error in getAttributeValues:', err);

      throw new HttpException(
        'Failed to fetch attribute values',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getProductById(id: string) {
    try {
      const product = await this.productModel
        .findById(id)
        .populate("mainCategoryId", "categoryName")
        .populate("subCategoryId", "categoryName")
        .populate("subChildCategoryId", "categoryName")
        .lean();

      if (!product) {
        throw new NotFoundException("Product not found");
      }

      const variants = await this.productVarientsModel
        .find({ productId: id })
        .lean();

      if (!variants.length) {
        return {
          success: true,
          message: "Product details fetched successfully",
          data: { ...product, variants: [] }
        };
      }

      const variantIds = variants.map(v => String(v._id));

      const variantAttributeValues = await this.variantAttributeValuesModel
        .find({ productVariantId: { $in: variantIds } })
        .populate("attributeId", "attributename")
        .populate("attributeValuesId", "value")
        .lean();

      const variantImages = await this.variantImageModel
        .find({ productVariantId: { $in: variantIds } })
        .lean();

      const finalVariants = variants.map(variant => {
        const vid = String(variant._id);

        return {
          ...variant,

          attributes: variantAttributeValues.filter(a =>
            String(a.productVariantId) === vid
          ),

          images: variantImages.filter(img =>
            String(img.productVariantId) === vid
          )
        };
      });

      return {
        success: true,
        message: "Product details fetched successfully",
        data: {
          ...product,
          variants: finalVariants
        }
      };

    } catch (err) {
      console.error("Error in getProductById:", err);

      if (err instanceof NotFoundException) throw err;

      throw new HttpException(
        "Failed to fetch product details",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getProductVariantById(id: string) {
    try {

      const variant = await this.productVarientsModel
        .findById(id)
        .lean();

      if (!variant) {
        throw new NotFoundException("Product variant not found");
      }

      const variantId = String(variant._id);

      const product = await this.productModel
        .findById(variant.productId)
        .populate("mainCategoryId", "categoryName")
        .populate("subCategoryId", "categoryName")
        .populate("subChildCategoryId", "categoryName")
        .lean();

      const attributes = await this.variantAttributeValuesModel
        .find({ productVariantId: variantId })
        .populate("attributeId", "categoryName")
        .populate("attributeValuesId", "value")
        .lean();

      const images = await this.variantImageModel
        .find({ productVariantId: variantId })
        .lean();

      const result = {
        ...variant,
        productDetails: product || null,
        attributes: attributes || [],
        images: images || []
      };

      return {
        success: true,
        message: "Product variant details fetched successfully",
        data: result
      };

    } catch (err) {
      console.error("Error in getProductVariantById:", err);

      if (err instanceof NotFoundException) throw err;

      throw new HttpException(
        "Failed to fetch product variant details",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getAttributeById(id: string) {
    try {
      const attr = await this.attributesModel.findById(id).lean();

      if (!attr) throw new NotFoundException("Attribute not found");

      return {
        success: true,
        message: "Attribute fetched successfully",
        data: attr,
      };

    } catch (err) {
      console.error("Error in getAttributeById:", err);
      throw new HttpException("Failed to fetch attribute", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAttributeValueById(id: string) {
    try {
      const attrValue = await this.attributesValuesModel
        .findById(id)
        .populate("attributeId", "attributename")
        .lean();

      if (!attrValue) throw new NotFoundException("Attribute value not found");

      return {
        success: true,
        message: "Attribute value fetched successfully",
        data: {
          ...attrValue,
          attributeName: attrValue.attributeId?.attributename || null,
        }
      };

    } catch (err) {
      console.error("Error in getAttributeValueById:", err);
      throw new HttpException("Failed to fetch attribute value", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getInventoryCategoryById(id: string) {
    try {
      const cat = await this.inventoryCategoryModel
        .findById(id)
        .populate("parentId", "categoryName level")
        .lean();

      if (!cat) throw new NotFoundException("Category not found");

      return {
        success: true,
        message: "Category fetched successfully",
        data: {
          ...cat,
          parentCategoryName: cat.parentId?.categoryName || null,
          parentCategoryLevel: cat.parentId?.level || null,
        }
      };

    } catch (err) {
      console.error("Error in getInventoryCategoryById:", err);
      throw new HttpException("Failed to fetch category", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getVariantAttributeValueById(id: string) {
    try {
      const value = await this.variantAttributeValuesModel
        .findById(id)
        .populate("productVariantId", "variantName variantSku price stock")
        .populate("attributeId", "attributename")
        .populate("attributeValuesId", "value")
        .lean();

      if (!value) throw new NotFoundException("Variant attribute value not found");

      return {
        success: true,
        message: "Variant attribute value fetched successfully",
        data: {
          ...value,
          productVariantName: value.productVariantId?.variantName || null,
          productVariantSku: value.productVariantId?.variantSku || null,
        }
      };

    } catch (err) {
      console.error("Error in getVariantAttributeValueById:", err);
      throw new HttpException("Failed to fetch variant attribute value", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getVariantImageById(id: string) {
    try {
      const img = await this.variantImageModel
        .findById(id)
        .populate("productVariantId", "variantName variantSku price stock")
        .lean();

      if (!img) throw new NotFoundException("Variant image not found");

      return {
        success: true,
        message: "Variant image fetched successfully",
        data: {
          ...img,
          variantName: img.productVariantId?.variantName || null,
          variantSku: img.productVariantId?.variantSku || null,
        }
      };

    } catch (err) {
      console.error("Error in getVariantImageById:", err);
      throw new HttpException("Failed to fetch variant image", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getProductDetailsById(productId: string) {
    try {
      const product = await this.productModel
        .findOne({
          _id: productId,
          isActive: true,
          isDeleted: false,
        })
        .populate("mainCategoryId", "categoryName level")
        .populate("subCategoryId", "categoryName level")
        .populate("subChildCategoryId", "categoryName level")
        .lean();

      if (!product) {
        throw new NotFoundException("Product not found");
      }

      const variants = await this.productVarientsModel
        .find({
          productId,
          isActive: true,
          isDeleted: false,
        })
        .lean();

      const variantIds = variants.map(v => v._id);

      const [attributes, images] = await Promise.all([
        this.variantAttributeValuesModel
          .find({ productVariantId: { $in: variantIds } })
          .populate("attributeId", "attributename")
          .populate("attributeValuesId", "value")
          .lean(),

        this.variantImageModel
          .find({ productVariantId: { $in: variantIds } })
          .lean(),
      ]);

      const attrMap = new Map<string, any[]>();
      attributes.forEach(a => {
        const key = String(a.productVariantId);
        if (!attrMap.has(key)) attrMap.set(key, []);
        attrMap.get(key)!.push(a);
      });

      const imageMap = new Map<string, string[]>();
      images.forEach(i => {
        const key = String(i.productVariantId);
        if (!imageMap.has(key)) imageMap.set(key, []);
        imageMap.get(key)!.push(i.imageUrl);
      });

      const totalStock = variants.reduce(
        (sum, v) => sum + Number(v.stock || 0),
        0
      );

      const finalProduct = {
        id: product._id,
        name: product.productName,
        brand: product.brand,
        description: product.description,
        about: product.about,
        rating: product.rating,
        discount: product.discount,
        offer: product.offer,
        created: product.createdAt,

        quantity: totalStock,
        isStock: totalStock > 0,

        inventoryCategories: [
          product.mainCategoryId && {
            id: product.mainCategoryId._id,
            name: product.mainCategoryId.categoryName,
            level: "MAIN",
          },
          product.subCategoryId && {
            id: product.subCategoryId._id,
            name: product.subCategoryId.categoryName,
            level: "SUB",
          },
          product.subChildCategoryId && {
            id: product.subChildCategoryId._id,
            name: product.subChildCategoryId.categoryName,
            level: "SUBCHILD",
          },
        ].filter(Boolean),

        variants: variants.map(v => ({
          variantId: v._id,
          variantName: v.variantName,
          stock: Number(v.stock),
          salePrice: v.salePrice,
          offerPrice: v.offerPrice,

          attributes: (attrMap.get(String(v._id)) || []).map(a => ({
            attributeId: a.attributeId?._id,
            attributeName: a.attributeId?.attributename,
            attributeValueId: a.attributeValuesId?._id,
            attributeValue: a.attributeValuesId?.value,
          })),

          images: imageMap.get(String(v._id)) || [],
        })),
      };

      return {
        success: true,
        statusCode: 200,
        message: "Product details fetched successfully",
        data: finalProduct,
      };

    } catch (err) {
      console.error("getProductDetailsById error:", err);

      throw err instanceof HttpException
        ? err
        : new HttpException(
          {
            success: false,
            statusCode: 500,
            message: err.message || "Failed to fetch product details",
            data: null,
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
  }



  async deleteAttributeValue(id: string) {
    try {
      const exists = await this.attributesValuesModel.findById(id);
      if (!exists) throw new NotFoundException('Attribute value not found');

      const used = await this.variantAttributeValuesModel.findOne({
        attributeValuesId: id
      }).lean();

      if (used) {
        throw new ConflictException(
          'Cannot delete attribute value because it is used in product variants'
        );
      }

      await this.attributesValuesModel.findByIdAndDelete(id);

      return {
        success: true,
        message: 'Attribute value deleted successfully',
        data: null
      };

    } catch (err) {
      if (err instanceof HttpException) throw err;

      throw new HttpException(
        'Failed to delete attribute value',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async deleteInventoryCategory(id: string) {
    try {
      const exists = await this.inventoryCategoryModel.findById(id);
      if (!exists) throw new NotFoundException('Category not found');

      const childExists = await this.inventoryCategoryModel.findOne({
        parentId: id
      }).lean();

      if (childExists) {
        throw new ConflictException(
          'Cannot delete category because child categories exist'
        );
      }

      const productExists = await this.productModel.findOne({
        $or: [
          { mainCategoryId: id },
          { subCategoryId: id },
          { subChildCategoryId: id }
        ]
      }).lean();

      if (productExists) {
        throw new ConflictException(
          'Cannot delete category because products exist'
        );
      }

      await this.inventoryCategoryModel.findByIdAndDelete(id);

      return {
        success: true,
        message: 'Category deleted successfully',
        data: null
      };

    } catch (err) {
      if (err instanceof HttpException) throw err;

      throw new HttpException(
        'Failed to delete category',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async deleteAttribute(id: string) {
    try {
      const exists = await this.attributesModel.findById(id);
      if (!exists) throw new NotFoundException('Attribute not found');

      const used = await this.attributesValuesModel.findOne({ attributeId: id }).lean();
      if (used) {
        throw new ConflictException(
          'Cannot delete attribute because attribute values exist'
        );
      }

      await this.attributesModel.findByIdAndDelete(id);

      return {
        success: true,
        message: 'Attribute deleted successfully',
        data: null
      };

    } catch (err) {
      if (err instanceof HttpException) throw err;

      throw new HttpException(
        'Failed to delete attribute',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async deleteProduct(id: string) {
    try {
      const product = await this.productModel.findById(id);
      if (!product) throw new NotFoundException('Product not found');

      const variantExists = await this.productVarientsModel.findOne({
        productId: id
      }).lean();

      if (variantExists) {
        throw new ConflictException(
          'Cannot delete product because variants exist. Delete variants first.'
        );
      }

      await this.productModel.findByIdAndDelete(id);

      return {
        success: true,
        message: 'Product deleted successfully',
        data: null
      };

    } catch (err) {
      if (err instanceof HttpException) throw err;

      throw new HttpException(
        'Failed to delete product',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async deleteProductVariant(id: string) {
    try {
      const variant = await this.productVarientsModel.findById(id);
      if (!variant) throw new NotFoundException('Product variant not found');

      // const attrExists = await this.variantAttributeValuesModel.findOne({
      //   productVariantId: id
      // }).lean();

      // if (attrExists) {
      //   throw new ConflictException(
      //     'Cannot delete variant because attributes exist'
      //   );
      // }

      // const imageExists = await this.variantImageModel.findOne({
      //   productVariantId: id
      // }).lean();

      // if (imageExists) {
      //   throw new ConflictException(
      //     'Cannot delete variant because images exist'
      //   );
      // }

      await this.productVarientsModel.findByIdAndDelete(id);

      return {
        success: true,
        message: 'Product variant deleted successfully',
        data: null
      };

    } catch (err) {
      if (err instanceof HttpException) throw err;

      throw new HttpException(
        'Failed to delete product variant',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async deleteVariantAttributeValue(id: string) {
    try {
      const exists = await this.variantAttributeValuesModel.findById(id);
      if (!exists) throw new NotFoundException('Variant attribute value not found');

      await this.variantAttributeValuesModel.findByIdAndDelete(id);

      return {
        success: true,
        message: 'Variant attribute value deleted successfully',
        data: null
      };

    } catch (err) {
      if (err instanceof HttpException) throw err;

      throw new HttpException(
        'Failed to delete variant attribute value',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async deleteVariantImage(id: string) {
    try {
      const exists = await this.variantImageModel.findById(id);
      if (!exists) throw new NotFoundException('Variant image not found');

      await this.variantImageModel.findByIdAndDelete(id);

      return {
        success: true,
        message: 'Variant image deleted successfully',
        data: null
      };

    } catch (err) {
      if (err instanceof HttpException) throw err;

      throw new HttpException(
        'Failed to delete variant image',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }


}
