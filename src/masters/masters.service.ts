
import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { roles, rolesDetails } from 'src/schema/role.schema';
import { roleDTO } from './DTO/role.dto';
import { admin } from 'src/schema/admin.schema';
import { category, categoryDetails } from 'src/schema/category.schema';
import { region, regionDetails } from 'src/schema/region.schema';
import { categoryDTO } from './DTO/category.dto';
import { regionDTO } from './DTO/region.dto';
@Injectable()

export class MastersService {




  constructor(

    //one brik//
    @InjectModel(category.name) private readonly category: Model<categoryDetails>,
    @InjectModel(region.name) private readonly region: Model<regionDetails>,


    //inovice traders//
    // @InjectModel(relationship.name) private readonly relationship: Model<relationshipDetails>,
    // @InjectModel(profession.name) private readonly profession: Model<professionDetails>,
    @InjectModel(roles.name) private readonly roles: Model<rolesDetails>,


  ) { }



  //onebrik//
  async createCategory(data: categoryDTO) {
    try {
      const exists = await this.category.findOne({
        categoryName: data.categoryName,
        isDeleted: false
      });

      if (exists) {
        throw new HttpException(
          {
            success: false,
            message: "category already exists",
            statusCode: 409,
            data: null
          },
          HttpStatus.CONFLICT
        );
      }

      const createdCategory = await this.category.create(data);

      return {
        success: true,
        message: "Category created successfully",
        statusCode: 201,
        data: createdCategory
      };

    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || "Failed to create Category",
          statusCode: 400,
          data: null
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async getAllCategory(
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ) {
    try {
      const skip = (page - 1) * limit;


      const searchFilter = search
        ? {
          categoryName: {
            $regex: search,
            $options: 'i',
          },
        }
        : {};

      const total = await this.category.countDocuments(searchFilter);

      const categoryList = await this.category
        .find(searchFilter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      return {
        success: true,
        message: "Category fetched successfully",
        statusCode: 200,
        data: {
          vendor: categoryList,
          total,
          page,
          limit,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || "Failed to fetch Category",
          statusCode: 400,
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateCategory(id: string, updateData: Partial<categoryDTO>): Promise<{ success: boolean; message: string; statusCode: number; data?: any; }> {
    try {

      const existingCategory = await this.category.findById(id);
      if (!existingCategory) {
        return {
          success: false,
          message: "Category not found",
          statusCode: 404
        };
      }


      if (updateData.categoryName) {
        const duplicateVendor = await this.category.findOne({
          categoryName: updateData.categoryName,
          _id: { $ne: id }
        });

        if (duplicateVendor) {
          return {
            success: false,
            message: "Category name already exists",
            statusCode: 409
          };
        }
      }

      const updateCategory = await this.category.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      return {
        success: true,
        message: "Category updated successfully",
        statusCode: 200,
        data: updateCategory
      };

    } catch (error) {
      return {
        success: false,
        message: error.message || "Failed to update Category",
        statusCode: 400
      };
    }
  }

  async deleteCategory(id: string): Promise<{success: boolean;message: string;statusCode: number}> {
    try {
      const CategoryData = await this.category.findById(id);

      if (!CategoryData) {
        return {
          success: false,
          message: "Category not found",
          statusCode: 404
        };
      }

      await this.category.findByIdAndUpdate(id, {
        isDeleted: true,
        isActive: false
      });

      return {
        success: true,
        message: "Category deleted successfully",
        statusCode: 200
      };

    } catch (error) {
      return {
        success: false,
        message: error.message || "Failed to delete Category",
        statusCode: 400
      };
    }
  }



  async createRegion(data: regionDTO) {
    try {
      const exists = await this.region.findOne({
        regionName: data.regionName,
        isDeleted: false
      });

      if (exists) {
        throw new HttpException(
          {
            success: false,
            message: "region already exists",
            statusCode: 409,
            data: null
          },
          HttpStatus.CONFLICT
        );
      }



      const createdRegion = await this.region.create(data);

      return {
        success: true,
        message: "region created successfully",
        statusCode: 201,
        data: createdRegion
      };

    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || "Failed to create Region",
          statusCode: 400,
          data: null
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async getAllRegion(
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ) {
    try {
      const skip = (page - 1) * limit;


      const searchFilter = search
        ? {
          regionName: {
            $regex: search,
            $options: 'i',
          },
        }
        : {};

      const total = await this.region.countDocuments(searchFilter);

      const regionList = await this.region
        .find(searchFilter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      return {
        success: true,
        message: "Region fetched successfully",
        statusCode: 200,
        data: {
          vendor: regionList,
          total,
          page,
          limit,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || "Failed to fetch Region",
          statusCode: 400,
          data: null,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateRegion(id: string, updateData: Partial<regionDTO>): Promise<{ success: boolean; message: string; statusCode: number; data?: any; }> {
    try {

      const existingRegion = await this.region.findById(id);
      if (!existingRegion) {
        return {
          success: false,
          message: "Region not found",
          statusCode: 404
        };
      }


      if (updateData.regionName) {
        const duplicateRegion = await this.category.findOne({
          regionName: updateData.regionName,
          _id: { $ne: id }
        });

        if (duplicateRegion) {
          return {
            success: false,
            message: "Region name already exists",
            statusCode: 409
          };
        }
      }

      const updateRegion = await this.region.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      return {
        success: true,
        message: "Region updated successfully",
        statusCode: 200,
        data: updateRegion
      };

    } catch (error) {
      return {
        success: false,
        message: error.message || "Failed to update Region",
        statusCode: 400
      };
    }
  }
  
  async deleteRegion(id: string): Promise<{success: boolean;message: string;statusCode: number}> {
    try {
      const regionDate = await this.region.findById(id);

      if (!regionDate) {
        return {
          success: false,
          message: "Region not found",
          statusCode: 404
        };
      }

      await this.region.findByIdAndUpdate(id, {
        isDeleted: true,
        isActive: false
      });

      return {
        success: true,
        message: "Region deleted successfully",
        statusCode: 200
      };

    } catch (error) {
      return {
        success: false,
        message: error.message || "Failed to delete Region",
        statusCode: 400
      };
    }
  }



}
