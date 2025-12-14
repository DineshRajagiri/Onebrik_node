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

  async createInventoryCategory(dto: inventoryCategoryDTO) {
    try {
      if (!dto.categoryName?.trim()) {
        throw new BadRequestException("Category name is required");
      }

      if (!dto.level?.trim()) {
        throw new BadRequestException("Category level is required");
      }

      const categoryName = dto.categoryName.trim();
      const level = dto.level.trim().toUpperCase();

      if (!["MAIN", "SUB", "SUBCHILD"].includes(level)) {
        throw new BadRequestException("Invalid level. Allowed: MAIN, SUB, SUBCHILD");
      }


      const exists = await this.inventoryCategoryModel.findOne({ categoryName }).lean();
      if (exists) throw new ConflictException("Category name already exists");

      let parentId = null;
      let parentName = null;

      if (dto.parentId) {
        const parent = await this.inventoryCategoryModel.findById(dto.parentId).lean();
        if (!parent) throw new BadRequestException("Invalid parentId — parent category not found");

        parentId = parent._id;
        parentName = parent.categoryName;
      }

      const created = await this.inventoryCategoryModel.create({
        categoryName,
        parentId,
        level,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const responseData = {
        _id: created._id,
        categoryName: created.categoryName,
        level: created.level,
        parentId: created.parentId,
        parentName: parentName,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      };

      return {
        success: true,
        message: "Inventory category created successfully",
        data: responseData,
      };

    } catch (err) {
      console.error("Error in createInventoryCategory:", err);

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

      if (!dto.price) {
        throw new BadRequestException("Variant price is required");
      }
      if (!dto.stock) {
        throw new BadRequestException("Variant stock is required");
      }

      const createdVariant = await this.productVarientsModel.create({
        productId: dto.productId,
        price: dto.price,
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

      if (dto.price !== undefined) {
        variant.price = dto.price;
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
        name
      }).lean();

      if (duplicate) {
        throw new ConflictException("Another attribute with this name already exists");
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

  async updateInventoryCategory(id: string, dto: inventoryCategoryDTO) {
    try {
      const category = await this.inventoryCategoryModel.findById(id);
      if (!category) {
        throw new NotFoundException("Category not found");
      }

      if (dto.categoryName) {
        const existing = await this.inventoryCategoryModel.findOne({
          name: dto.categoryName.trim(),
          _id: { $ne: id }
        });

        if (existing) {
          throw new ConflictException("Category name already exists");
        }

        category.categoryName = dto.categoryName.trim();
      }

      if (dto.parentId !== undefined) {
        if (dto.parentId) {
          const parent = await this.inventoryCategoryModel.findById(dto.parentId);
          if (!parent) {
            throw new BadRequestException("Invalid parentId");
          }
        }

        category.parentId = dto.parentId || null;
      }

      if (dto.level) {
        if (!["MAIN", "SUB", "SUB_CHILD"].includes(dto.level)) {
          throw new BadRequestException("Invalid level value");
        }

        category.level = dto.level;
      }

      category.updatedAt = new Date();

      await category.save();

      return {
        success: true,
        message: "Category updated successfully",
        data: category
      };

    } catch (err) {
      console.error("Error in updateInventoryCategory:", err);

      throw new HttpException(
        err.message || "Unexpected error updating category",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateVariantAttributeValue(
    productVariantId: string,
    dto: VariantAttributeValuesDTO
  ) {
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

      const filter: any = {};

      if (search) {
        filter.categoryName = { $regex: search, $options: "i" };
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
      throw new HttpException("Failed to fetch categories", HttpStatus.INTERNAL_SERVER_ERROR);
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
        this.productVarientsModel
          .find(filter)
          .skip(skip)
          .limit(limit)
          .lean(),

        this.productVarientsModel.countDocuments(filter)
      ]);

      if (!variants.length) {
        return {
          success: true,
          message: "No product variants found",
          data: [],
          total,
          page,
          limit,
        };
      }

      const variantIds = variants.map(v => v._id.toString());

      const allImages = await this.variantImageModel
        .find({ productVariantId: { $in: variantIds } })
        .lean();

      const allAttributes = await this.variantAttributeValuesModel
        .find({ productVariantId: { $in: variantIds } })
        .populate("attributeId", "attributename")
        .populate("attributeValuesId", "value")
        .lean();

      const productIds = [...new Set(variants.map(v => v.productId))];

      const products = await this.productModel
        .find({ _id: { $in: productIds } })
        .populate("mainCategoryId", "categoryName level")
        .populate("subCategoryId", "categoryName level")
        .populate("subChildCategoryId", "categoryName level")
        .lean();

      const productMap = {};
      products.forEach(p => (productMap[p._id] = p));

      const finalData = variants.map(v => {
        const vid = v._id.toString();
        const product = productMap[v.productId] || {};

        return {
          ...v,

          productName: product.productName || null,

          mainCategoryId: product.mainCategoryId?._id || null,
          mainCategoryName: product.mainCategoryId?.categoryName || null,

          subCategoryId: product.subCategoryId?._id || null,
          subCategoryName: product.subCategoryId?.categoryName || null,

          subChildCategoryId: product.subChildCategoryId?._id || null,
          subChildCategoryName: product.subChildCategoryId?.categoryName || null,

          attributes: allAttributes
            .filter(a => String(a.productVariantId) === vid)
            .map(a => ({
              _id: a._id,
              attributeName: a.attributeId?.attributename || null,
              attributeValue: a.attributeValuesId?.value || null,
            })),

          images: allImages.filter(img => String(img.productVariantId) === vid),
        };
      });

      return {
        success: true,
        message: "Product variants fetched successfully",
        data: finalData,
        total,
        page,
        limit,
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
      let { page = 1, limit = 10, search = "", mainCategoryId, subCategoryId, subChildCategoryId } = query;

      page = Number(page);
      limit = Number(limit);
      const skip = (page - 1) * limit;

      const filter: any = {};

      if (search.trim()) {
        filter.productName = { $regex: search.trim(), $options: "i" };
      }

      if (mainCategoryId) filter.mainCategoryId = mainCategoryId;
      if (subCategoryId) filter.subCategoryId = subCategoryId;
      if (subChildCategoryId) filter.subChildCategoryId = subChildCategoryId;

      const [products, total] = await Promise.all([
        this.productModel
          .find(filter)
          .populate("mainCategoryId", "categoryName level")
          .populate("subCategoryId", "categoryName level")
          .populate("subChildCategoryId", "categoryName level")
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .lean(),

        this.productModel.countDocuments(filter),
      ]);

      const finalData = products.map(p => ({
        ...p,

        mainCategoryId: p.mainCategoryId?._id || null,
        mainCategoryName: p.mainCategoryId?.categoryName || null,

        subCategoryId: p.subCategoryId?._id || null,
        subCategoryName: p.subCategoryId?.categoryName || null,

        subChildCategoryId: p.subChildCategoryId?._id || null,
        subChildCategoryName: p.subChildCategoryId?.categoryName || null,
      }));

      return {
        success: true,
        message: "Products fetched successfully",
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        data: finalData,
      };

    } catch (err) {
      console.error("Error in getProducts:", err);
      throw new HttpException("Failed to fetch products", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

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

      return {
        success: true,
        message: "Attribute values fetched successfully",
        data: list,
        total,
        page,
        limit,
      };

    } catch (err) {
      console.error("Error in getAllAttributeValues:", err);
      throw new HttpException("Failed to fetch attribute values", HttpStatus.INTERNAL_SERVER_ERROR);
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
        price: item.productVariantId?.price || null,
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







  async deleteAttributeValue(id: string) {
    try {
      const exists = await this.attributesValuesModel.findById(id);
      if (!exists) throw new NotFoundException('Attribute value not found');

      await this.attributesValuesModel.findByIdAndDelete(id);

      return {
        success: true,
        message: 'Attribute value deleted successfully',
        data: null,
      };

    } catch (err) {
      console.error('Error in deleteAttributeValue:', err);

      if (err instanceof NotFoundException)
        throw err;

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

      await this.inventoryCategoryModel.findByIdAndDelete(id);

      return {
        success: true,
        message: 'Category deleted successfully',
        data: null,
      };

    } catch (err) {
      console.error('Error in deleteInventoryCategory:', err);

      if (err instanceof NotFoundException)
        throw err;

      throw new HttpException(
        'Unexpected error while deleting category',
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
        throw new ConflictException('Cannot delete attribute because values exist');
      }

      await this.attributesModel.findByIdAndDelete(id);

      return {
        success: true,
        message: 'Attribute deleted successfully',
        data: null,
      };

    } catch (err) {
      console.log('Error in deleteAttribute:', err);

      if (err instanceof NotFoundException || err instanceof ConflictException)
        throw err;

      throw new HttpException('Failed to delete attribute', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteProduct(id: string) {
    try {
      const product = await this.productModel.findById(id);
      if (!product) {
        throw new NotFoundException("Product not found");
      }

      // Delete all product variants
      const variants = await this.productVarientsModel.find({ productId: id }).lean();
      const variantIds = variants.map(v => v._id);

      if (variantIds.length > 0) {
        await this.variantAttributeValuesModel.deleteMany({
          productVariantId: { $in: variantIds }
        });

        await this.variantImageModel.deleteMany({
          productVariantId: { $in: variantIds }
        });

        await this.productVarientsModel.deleteMany({
          productId: id
        });
      }

      await this.productModel.findByIdAndDelete(id);

      return {
        success: true,
        message: "Product deleted successfully",
        data: null
      };

    } catch (err) {
      console.error("Error in deleteProduct:", err);
      throw new HttpException(
        "Failed to delete product",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async deleteProductVariant(id: string) {
    try {
      const variant = await this.productVarientsModel.findById(id);
      if (!variant) {
        throw new NotFoundException("Product variant not found");
      }

      await this.variantAttributeValuesModel.deleteMany({
        productVariantId: id
      });

      await this.variantImageModel.deleteMany({
        productVariantId: id
      });

      await this.productVarientsModel.findByIdAndDelete(id);

      return {
        success: true,
        message: "Product variant deleted successfully",
        data: null
      };

    } catch (err) {
      console.error("Error in deleteProductVariant:", err);
      throw new HttpException(
        "Failed to delete product variant",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async deleteVariantAttributeValue(id: string) {
    try {
      const exists = await this.variantAttributeValuesModel.findById(id);

      if (!exists) {
        throw new NotFoundException("Variant attribute value not found");
      }

      await this.variantAttributeValuesModel.findByIdAndDelete(id);

      return {
        success: true,
        message: "Variant attribute value deleted successfully",
        data: null
      };

    } catch (err) {
      console.error("Error in deleteVariantAttributeValue:", err);
      throw new HttpException(
        "Failed to delete variant attribute value",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async deleteVariantImage(id: string) {
    try {
      const exists = await this.variantImageModel.findById(id);

      if (!exists) {
        throw new NotFoundException("Variant image not found");
      }

      await this.variantImageModel.findByIdAndDelete(id);

      return {
        success: true,
        message: "Variant image deleted successfully",
        data: null
      };

    } catch (err) {
      console.error("Error in deleteVariantImage:", err);
      throw new HttpException(
        "Failed to delete variant image",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }



}
