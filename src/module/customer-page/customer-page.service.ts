import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { attributes, AttributesDocument } from 'src/schema/attributes.schema';
import { inventoryCategory, inventoryCategoryDocument } from 'src/schema/inventoryCategory.schema';
import { SubCursor, SubCursorDocument } from 'src/schema/subcursore.schema';
import { Product, ProductDocument } from 'src/schema/products.schema';
import { productVariants, productVariantsDocument } from 'src/schema/productVariants.schema';
import { VariantAttributeValues } from 'src/schema/variantAttributeValues.schema';
import { VariantImages, VariantImagesDocument } from 'src/schema/variantImages.schema';

@Injectable()
export class CustomerPageService {
  constructor(
    @InjectModel(inventoryCategory.name) private inventoryCategoryModel: Model<inventoryCategoryDocument>,
    @InjectModel(SubCursor.name) private subCursorDocument: Model<SubCursorDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(productVariants.name) private productVariantsModel: Model<productVariantsDocument>,
    @InjectModel(VariantAttributeValues.name) private variantAttributeValuesModel: Model<VariantAttributeValues>,
    @InjectModel(VariantImages.name) private variantImageModel: Model<VariantImagesDocument>,
  ) { }


  async customerViewedheader() {
    try {
      const data = await this.inventoryCategoryModel.find({
        isActive: true,
        isDeleted: false,
        level: 'MAIN'
      }, {
        createdAt: 0, updatedAt: 0, __v: 0, isActive: 0,
        isDeleted: 0, parentId: 0
      }).exec();
      return { message: 'Product view logged successfully', data: data, success: true };;
    } catch (err) {
      throw err;
    }
  }

  async customerViewedSubCatheader() {
    try {
      const data = await this.inventoryCategoryModel.find({
        isActive: true,
        isDeleted: false,
        level: 'SUB'
      }, {
        createdAt: 0, updatedAt: 0, __v: 0, isActive: 0,
        isDeleted: 0, parentId: 0
      }).exec();
      return { message: 'Product view logged successfully', data: data, success: true };;
    } catch (err) {
      throw err;
    }
  }

  async customerViewedSubheader(id: string) {
    try {
      const data = await this.inventoryCategoryModel.aggregate([
        {
          $match: {
            isActive: true,
            parentId: id,
            level: 'SUB'
          }
        },

        {
          $lookup: {
            from: 'inventorycategories',
            localField: '_id',
            foreignField: 'parentId',
            as: 'subChildren'
          }
        },
        {
          $addFields: {
            subChildren: {
              $filter: {
                input: '$subChildren',
                as: 'child',
                cond: { $eq: ['$$child.level', 'SUBCHILD'] }
              }
            }
          }
        }
      ]);
      return {
        message: 'Categories fetched successfully',
        data: data,
        success: true
      };
    } catch (err) {
      throw err;
    }
  }

  async getSubHeaderMaindata() {
    try {
      const data = await this.inventoryCategoryModel.find({
        isActive: true,
        isDeleted: false,
        level: 'SUB'
      }, {
        createdAt: 0, updatedAt: 0, __v: 0, isActive: 0,
        isDeleted: 0, parentId: 0
      }).exec();
      return { message: 'Sub Header view logged successfully', data: data, success: true };;
    } catch (err) {
      throw err;
    }
  }

  async getAttributesByCategory(body) {
    try {
      const data = await this.subCursorDocument.insertOne(body);
      return { message: 'Attributes fetched successfully', data: data, success: true };;
    } catch (err) {
      throw err;
    }
  }

  async GetSubCursor() {
    try {
      const data = await this.subCursorDocument.find({
      }, {
        createdAt: 0, updatedAt: 0, __v: 0
      }).exec();
      return { message: 'Sub Cursor fetched successfully', data: data, success: true };;
    } catch (err) {
      throw err;
    }
  }

  async getLatestProducts(query: any) {
    try {
      let { page = 1, limit = 10 } = query;

      page = Number(page) > 0 ? Number(page) : 1;
      limit = Number(limit) > 0 ? Number(limit) : 10;
      const skip = (page - 1) * limit;

      const filter: any = {
        isActive: true,
        isDeleted: false,
      };

      const [products, total] = await Promise.all([
        this.productModel
          .find(filter)
          .populate("mainCategoryId", "categoryName level")
          .populate("subCategoryId", "categoryName level")
          .populate("subChildCategoryId", "categoryName level")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),

        this.productModel.countDocuments(filter),
      ]);

      const productIds = products.map(p => p._id);

      const variants = await this.productVariantsModel
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

      const finalProducts = products.map(p => {
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

      return {
        success: true,
        message: "Latest products fetched successfully",
        products: finalProducts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };

    } catch (err) {
      console.error("Error in getLatestProducts:", err);
      throw new HttpException(
        "Failed to fetch latest products",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getProductsBySubCategory(query: any, body: { id: string }) {
    try {
      let { page = 1, limit = 10 } = query;
      const { id } = body;

      if (!id) {
        throw new HttpException(
          "subCategoryId is required",
          HttpStatus.BAD_REQUEST
        );
      }

      page = Number(page) > 0 ? Number(page) : 1;
      limit = Number(limit) > 0 ? Number(limit) : 10;
      const skip = (page - 1) * limit;

      const filter: any = {
        isActive: true,
        isDeleted: false,
        subCategoryId: id,
      };

      const [products, total] = await Promise.all([
        this.productModel
          .find(filter)
          .populate("mainCategoryId", "categoryName level")
          .populate("subCategoryId", "categoryName level")
          .populate("subChildCategoryId", "categoryName level")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),

        this.productModel.countDocuments(filter),
      ]);

      const productIds = products.map(p => p._id);

      const variants = await this.productVariantsModel
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
      const finalProducts = products.map(p => {
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

      return {
        success: true,
        message: "Products fetched by subCategory successfully",
        products: finalProducts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };

    } catch (err) {
      console.error("Error in getProductsBySubCategory:", err);
      throw new HttpException(
        "Failed to fetch products",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getAllProducts(query: any) {
    try {
      let { page = 1, limit = 10, search = "", categoryId } = query;

      page = Number(page) > 0 ? Number(page) : 1;
      limit = Number(limit) > 0 ? Number(limit) : 10;
      const skip = (page - 1) * limit;

      const filter: any = {
        isActive: true,
        isDeleted: false,
      };
      if (categoryId) {
        const category = await this.inventoryCategoryModel
          .findById(categoryId)
          .lean();

        if (!category) {
          throw new HttpException("Invalid categoryId", HttpStatus.BAD_REQUEST);
        }

        if (category.level === "MAIN") {
          filter.mainCategoryId = categoryId;
        }

        if (category.level === "SUB") {
          filter.subCategoryId = categoryId;
        }

        if (category.level === "SUBCHILD") {
          filter.subChildCategoryId = categoryId;
        }
      }
      if (search.trim()) {
        const searchRegex = new RegExp(search.trim(), "i");

        const matchedCategories = await this.inventoryCategoryModel
          .find({ categoryName: searchRegex })
          .select("_id")
          .lean();

        const categoryIds = matchedCategories.map(c => c._id);

        filter.$or = [
          { productName: searchRegex },
          ...(categoryIds.length
            ? [
              { mainCategoryId: { $in: categoryIds } },
              { subCategoryId: { $in: categoryIds } },
              { subChildCategoryId: { $in: categoryIds } },
            ]
            : []),
        ];
      }
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

      const productIds = products.map(p => p._id);

      const variants = await this.productVariantsModel
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
      const finalProducts = products.map(p => {
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

      return {
        success: true,
        products: finalProducts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };

    } catch (err) {
      console.error("Error in getAllProducts:", err);
      throw new HttpException(
        "Failed to fetch products",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async productDetailsById(body: { id: string }) {
    try {
      const { id } = body;

      if (!id) {
        throw new HttpException(
          "productId is required",
          HttpStatus.BAD_REQUEST
        );
      }

      const product = await this.productModel
        .findOne({
          _id: id,
          isActive: true,
          isDeleted: false,
        })
        .populate("mainCategoryId", "categoryName level")
        .populate("subCategoryId", "categoryName level")
        .populate("subChildCategoryId", "categoryName level")
        .lean();

      if (!product) {
        throw new HttpException(
          "Product not found",
          HttpStatus.NOT_FOUND
        );
      }

      const variants = await this.productVariantsModel
        .find({
          productId: id,
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

      const formattedVariants = variants.map(v => ({
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
      }));

      return {
        success: true,
        message: "Product details fetched successfully",
        data: {
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

          variants: formattedVariants,
        },
      };

    } catch (err) {
      console.error("Error in productDetailsById:", err);

      throw err instanceof HttpException
        ? err
        : new HttpException(
          "Failed to fetch product details",
          HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
  }




}


