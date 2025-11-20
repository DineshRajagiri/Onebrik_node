
import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { relationshipDTO } from './DTO/realtionship.dto';
import { relationship, relationshipDetails } from 'src/schema/relationship.schema';
import { experience, experienceDetails } from 'src/schema/experience.schema';
import { incomeRange, incomeRangeDetails } from 'src/schema/IncomeRange.schema';
import { profession, professionDetails } from 'src/schema/Profession.schema';
import { experienceDTO } from './DTO/experience.dto';
import { incomeRangeDTO } from './DTO/incomeRange.dto';
import { professionDTO } from './DTO/profession.dto';
import { xScore, xScoreDetails } from 'src/schema/xScore.schema';
import { xScoreDTO } from './DTO/xScore.dto';
import { relationshipManager, relationshipManagerDetails } from 'src/schema/relationshipManager';
import { relationshipManagerDTO } from './DTO/realationshipManager.dto';
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
    @InjectModel(relationship.name) private readonly relationship: Model<relationshipDetails>,
    @InjectModel(experience.name) private readonly experience: Model<experienceDetails>,
    @InjectModel(incomeRange.name) private readonly incomeRange: Model<incomeRangeDetails>,
    @InjectModel(profession.name) private readonly profession: Model<professionDetails>,
    @InjectModel(xScore.name) private readonly xScore: Model<xScoreDetails>,
    @InjectModel(relationshipManager.name) private readonly relationshipManager: Model<relationshipManagerDetails>,
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


  //invoice//

  //relationship//
  async createRelationship(realtionship) {
    try {
      const exist = await this.relationship.findOne({
        relationshipTypeName: realtionship?.relationshipTypeName,
      });

      if (exist) {
        return {
          success: false,
          statusCode: HttpStatus.CONFLICT, // 409 Conflict
          message: 'Relationship already exist',
        };
      }

      const relationshipCreated = await this.relationship.create(realtionship);
      if (!relationshipCreated) {
        return {
          success: false,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR, // 500 Internal Server Error
          message: 'Unable to create relationship',
        };
      }

      return {
        success: true,
        statusCode: HttpStatus.CREATED, // 201 Created
        message: 'Relationship created successfully',
        relationship: relationshipCreated,
      };
    } catch (e) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST, // 400 Bad Request
          message: e?.message || 'An error occurred',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async getAllRelationship(page = 1, limit = 10, search = '') {
    try {
      const pageNumber = Math.max(1, page);
      const pageSize = Math.max(1, limit);
      const skip = (pageNumber - 1) * pageSize;
      const filter = search ? { relationshipTypeName: { $regex: search, $options: 'i' } } : {};
      const total = await this.relationship.countDocuments();
      const relationshipList = await this.relationship.find(filter).skip(skip).limit(pageSize);
      return {
        success: true,
        total,
        page: pageNumber,
        limit: pageSize,
        relationship: relationshipList,

      };
    } catch (e) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: e?.message || 'An error occurred',
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }
  async updateRelationship(id: string, updateData: Partial<relationshipDTO>): Promise<{ success: boolean; message: string; relationship?: relationshipDTO }> {
    try {
      const relationship = await this.relationship.findById(id);

      if (!relationship) {
        throw new NotFoundException(`Relationship with ID ${id} not found`);
      }

      const updatedRelationship = await this.relationship.findByIdAndUpdate(id, updateData, { new: true });

      if (!updatedRelationship) {
        throw new NotFoundException(`Relationship with ID ${id} not found`);
      }

      return {
        success: true,
        message: 'Relationship updated successfully',
        relationship: updatedRelationship.toObject() as unknown as relationshipDTO,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message || 'Update failed' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async deleteRelationship(id: string) {
    try {
      const deletedRelationship = await this.relationship.findByIdAndDelete(id);

      if (!deletedRelationship) {
        return {
          success: false,
          message: 'relationship not found',
        };
      }

      return {
        success: true,
        message: 'relationship deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error?.message || 'An error occurred while deleting the relationship',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async getRelationshipById(RelationshipId: string) {
    try {
      const relationship = await this.relationship.findById(RelationshipId);
      if (!relationship) {
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Relationship not found',
        };
      }
      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Relationship details retrieved successfully',
        relationship,
      };
    } catch (e) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: e?.message || 'An error occurred',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }


  //experience//
  async createExperience(experience) {
    try {
      const exist = await this.experience.findOne({
        experienceTypeName: experience?.experienceTypeName,
      });

      if (exist) {
        return {
          success: false,
          statusCode: HttpStatus.CONFLICT, // 409 Conflict
          message: 'Experience already exist',
        };
      }

      const experienceCreated = await this.experience.create(experience);
      if (!experienceCreated) {
        return {
          success: false,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR, // 500 Internal Server Error
          message: 'Unable to create experience',
        };
      }

      return {
        success: true,
        statusCode: HttpStatus.CREATED, // 201 Created
        message: 'Experience created successfully',
        experience: experienceCreated,
      };
    } catch (e) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST, // 400 Bad Request
          message: e?.message || 'An error occurred',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async getAllExperience(page = 1, limit = 10, search = '') {
    try {
      const pageNumber = Math.max(1, page);
      const pageSize = Math.max(1, limit);
      const skip = (pageNumber - 1) * pageSize;
      const filter = search ? { experienceTypeName: { $regex: search, $options: 'i' } } : {};
      const total = await this.experience.countDocuments();
      const experienceList = await this.experience.find(filter).skip(skip).limit(pageSize);
      return {
        success: true,
        total,
        page: pageNumber,
        limit: pageSize,
        experience: experienceList,

      };
    } catch (e) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: e?.message || 'An error occurred',
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }
  async updateExperience(id: string, updateData: experienceDTO): Promise<{ success: boolean; message: string; experience?: experienceDTO }> {
    try {
      const experience = await this.experience.findById(id);
      if (!experience) {
        throw new NotFoundException(`Experience with ID ${id} not found`);
      }

      const updatedExperience = await this.experience.findByIdAndUpdate(id, updateData, { new: true });

      if (!updatedExperience) {
        throw new HttpException('Experience update failed', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return {
        success: true,
        message: 'Experience updated successfully',
        experience: updatedExperience,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message || 'Update failed' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteExperience(id: string) {
    try {
      const deletedExperience = await this.experience.findByIdAndDelete(id);

      if (!deletedExperience) {
        return {
          success: false,
          message: 'Experience not found',
        };
      }

      return {
        success: true,
        message: 'Experience deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error?.message || 'An error occurred while Experience the module',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async getExperienceById(ExperienceId: string) {
    try {
      const experience = await this.experience.findById(ExperienceId);
      if (!experience) {
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Experience not found',
        };
      }
      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Experience details retrieved successfully',
        experience,
      };
    } catch (e) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: e?.message || 'An error occurred',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  //incomeRange//
  async createIncomeRange(incomeRange) {
    try {
      const exist = await this.incomeRange.findOne({
        incomeRangeTypeName: incomeRange?.incomeRangeTypeName,
      });

      if (exist) {
        return {
          success: false,
          statusCode: HttpStatus.CONFLICT, // 409 Conflict
          message: 'IncomeRange already exist',
        };
      }

      const incomeRangeCreated = await this.incomeRange.create(incomeRange);
      if (!incomeRangeCreated) {
        return {
          success: false,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR, // 500 Internal Server Error
          message: 'Unable to create incomeRange',
        };
      }

      return {
        success: true,
        statusCode: HttpStatus.CREATED, // 201 Created
        message: 'IncomeRange created successfully',
        incomeRange: incomeRangeCreated,
      };
    } catch (e) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST, // 400 Bad Request
          message: e?.message || 'An error occurred',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async getAllIncomeRange(page = 1, limit = 10, search = '') {
    try {
      const pageNumber = Math.max(1, page);
      const pageSize = Math.max(1, limit);
      const skip = (pageNumber - 1) * pageSize;
      const filter = search ? { incomeRangeTypeName: { $regex: search, $options: 'i' } } : {};
      const total = await this.incomeRange.countDocuments();
      const incomeRangeList = await this.incomeRange.find(filter).skip(skip).limit(pageSize);
      return {
        success: true,
        total,
        page: pageNumber,
        limit: pageSize,
        incomeRange: incomeRangeList,

      };
    } catch (e) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: e?.message || 'An error occurred',
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }
  async updateIncomeRange(id: string, updateData: incomeRangeDTO): Promise<{ success: boolean; message: string; incomeRange?: incomeRangeDTO }> {
    try {
      const incomeRange = await this.incomeRange.findById(id);
      if (!incomeRange) {
        throw new NotFoundException(`IncomeRange with ID ${id} not found`);
      }

      const updatedIncomeRange = await this.incomeRange.findByIdAndUpdate(id, updateData, { new: true });

      if (!updatedIncomeRange) {
        throw new HttpException('IncomeRange update failed', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return {
        success: true,
        message: 'IncomeRange updated successfully',
        incomeRange: updatedIncomeRange,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message || 'Update failed' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteIncomeRange(id: string) {
    try {
      const deletedIncomeRange = await this.incomeRange.findByIdAndDelete(id);

      if (!deletedIncomeRange) {
        return {
          success: false,
          message: 'IncomeRange not found',
        };
      }

      return {
        success: true,
        message: 'IncomeRange deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error?.message || 'An error occurred while IncomeRange the module',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async getIncomeRangeById(IncomeRangeId: string) {
    try {
      const incomeRange = await this.incomeRange.findById(IncomeRangeId);
      if (!incomeRange) {
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'IncomeRange not found',
        };
      }
      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'IncomeRange details retrieved successfully',
        incomeRange,
      };
    } catch (e) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: e?.message || 'An error occurred',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  //profession//
  async createProfession(profession) {
    try {
      const exist = await this.profession.findOne({
        professionTypeName: profession?.professionTypeName,
      });

      if (exist) {
        return {
          success: false,
          statusCode: HttpStatus.CONFLICT, // 409 Conflict
          message: 'Profession already exist',
        };
      }

      const professionCreated = await this.profession.create(profession);
      if (!professionCreated) {
        return {
          success: false,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR, // 500 Internal Server Error
          message: 'Unable to create Profession',
        };
      }

      return {
        success: true,
        statusCode: HttpStatus.CREATED, // 201 Created
        message: 'Experience created successfully',
        profession: professionCreated,
      };
    } catch (e) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST, // 400 Bad Request
          message: e?.message || 'An error occurred',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async getAllProfession(page = 1, limit = 10, search = '') {
    try {
      const pageNumber = Math.max(1, page);
      const pageSize = Math.max(1, limit);
      const skip = (pageNumber - 1) * pageSize;
      const filter = search ? { professionTypeName: { $regex: search, $options: 'i' } } : {};
      const total = await this.profession.countDocuments();
      const ProfessionList = await this.profession.find(filter).skip(skip).limit(pageSize);
      return {
        success: true,
        total,
        page: pageNumber,
        limit: pageSize,
        profession: ProfessionList,

      };
    } catch (e) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: e?.message || 'An error occurred',
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }
  async updateProfession(id: string, updateData: professionDTO): Promise<{ success: boolean; message: string; profession?: professionDTO }> {
    try {
      const profession = await this.profession.findById(id);
      if (!profession) {
        throw new NotFoundException(`Profession with ID ${id} not found`);
      }

      const updatedProfession = await this.profession.findByIdAndUpdate(id, updateData, { new: true });

      if (!updatedProfession) {
        throw new HttpException('Profession update failed', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return {
        success: true,
        message: 'Profession updated successfully',
        profession: updatedProfession,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message || 'Update failed' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteProfession(id: string) {
    try {
      const deletedProfession = await this.profession.findByIdAndDelete(id);

      if (!deletedProfession) {
        return {
          success: false,
          message: 'Profession not found',
        };
      }

      return {
        success: true,
        message: 'Profession deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error?.message || 'An error occurred while deleting the Profession',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async getProfessionById(ProfessionId: string) {
    try {
      const profession = await this.profession.findById(ProfessionId);
      if (!profession) {
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Profession not found',
        };
      }
      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Profession details retrieved successfully',
        profession,
      };
    } catch (e) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: e?.message || 'An error occurred',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  //xScore
  async createxScore(xScore) {
    try {
      // Remove the uniqueness check
      const xScoreCreated = await this.xScore.create(xScore);

      if (!xScoreCreated) {
        return {
          success: false,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Unable to create xScore',
        };
      }

      return {
        success: true,
        statusCode: HttpStatus.CREATED,
        message: 'X-Score created successfully',
        xScore: xScoreCreated,
      };
    } catch (e) {
      console.error("Error:", e.message); // Debugging
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: e?.message || 'An error occurred',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }


  async getAllxScore(page = 1, limit = 10, search = '') {
    try {
      const pageNumber = Math.max(1, page);
      const pageSize = Math.max(1, limit);
      const skip = (pageNumber - 1) * pageSize;
      const filter = search ? { xScoreTypeName: { $regex: search, $options: 'i' } } : {};
      const total = await this.xScore.countDocuments();
      const xScoreList = await this.xScore.find(filter).skip(skip).limit(pageSize);
      return {
        success: true,
        total,
        page: pageNumber,
        limit: pageSize,
        xScore: xScoreList,

      };
    } catch (e) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: e?.message || 'An error occurred',
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async updatexScore(id: string, updateData: xScoreDTO): Promise<{ success: boolean; message: string; xScore?: xScoreDTO }> {
    try {
      const xScore = await this.xScore.findById(id);
      if (!xScore) {
        throw new NotFoundException(`xScore with ID ${id} not found`);
      }

      const updatedxScore = await this.xScore.findByIdAndUpdate(id, updateData, { new: true });

      if (!updatedxScore) {
        throw new HttpException('xScore update failed', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // Convert the Mongoose document to a plain JavaScript object
      const transformedXScore: xScoreDTO = {
        xScoreValue: updatedxScore.xScoreValue, // Ensure correct field name
        xScoreName: updatedxScore.xScoreName,
      };


      return {
        success: true,
        message: 'xScore updated successfully',
        xScore: transformedXScore,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message || 'Update failed' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deletexScore(id: string) {
    try {
      const deletedxScore = await this.xScore.findByIdAndDelete(id);

      if (!deletedxScore) {
        return {
          success: false,
          message: 'xScore not found',
        };
      }

      return {
        success: true,
        message: 'xScore deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error?.message || 'An error occurred while deleting the xScore',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async getxScoreById(xScoreId: string) {
    try {
      const xScore = await this.xScore.findById(xScoreId);
      if (!xScore) {
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'xScore not found',
        };
      }
      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'xScore details retrieved successfully',
        xScore,
      };
    } catch (e) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: e?.message || 'An error occurred',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async xScoreList() {
    try {
      const xScore = await this.xScore
        .find({}, { _id: 1, xScoreValue: 1 })
        .lean();

      if (!xScore || xScore.length === 0) {
        return {
          success: true,
          message: 'No xScores available',
          data: [],
        };
      }

      const dropdownList = xScore.map((ent) => ({
        id: ent._id,
        value: ent.xScoreValue,
      }));

      return {
        success: true,
        message: 'xScore List',
        data: dropdownList,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error?.message || 'An unexpected error occurred',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  //RealationshipManager
  async createRelationshipManager(reltionshipManagaer) {
    try {
      const exist = await this.relationshipManager.findOne({
        Name: reltionshipManagaer?.Name,
      });

      if (exist) {
        return {
          success: false,
          statusCode: HttpStatus.CONFLICT, // 409 Conflict
          message: 'relationshipManager already exist',
        };
      }

      const relationshipManagerCreated = await this.relationshipManager.create(reltionshipManagaer);
      if (!relationshipManagerCreated) {
        return {
          success: false,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR, // 500 Internal Server Error
          message: 'Unable to create relationshipManager',
        };
      }

      return {
        success: true,
        statusCode: HttpStatus.CREATED, // 201 Created
        message: 'relationshipManager created successfully',
        relationship: relationshipManagerCreated,
      };
    } catch (e) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST, // 400 Bad Request
          message: e?.message || 'An error occurred',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getAllRelationshipManager(page = 1, limit = 10, search = '') {
    try {
      const pageNumber = Math.max(1, page);
      const pageSize = Math.max(1, limit);
      const skip = (pageNumber - 1) * pageSize;
      const filter = search ? { Name: { $regex: search, $options: 'i' } } : {};
      const total = await this.relationshipManager.countDocuments();
      const getAllRelationshipManagerList = await this.relationshipManager.find(filter).skip(skip).limit(pageSize);
      return {
        success: true,
        total,
        page: pageNumber,
        limit: pageSize,
        relationship: getAllRelationshipManagerList,

      };
    } catch (e) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: e?.message || 'An error occurred',
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }
  async updateRelationshipManager(id: string, updateData: Partial<relationshipManagerDTO>): Promise<{ success: boolean; message: string; relationshipManager?: relationshipManagerDTO }> {
    try {
      const relationshipManager = await this.relationshipManager.findById(id);

      if (!relationshipManager) {
        throw new NotFoundException(`RelationshipManager with ID ${id} not found`);
      }

      const updatedRelationshipManager = await this.relationshipManager.findByIdAndUpdate(id, updateData, { new: true });

      if (!updatedRelationshipManager) {
        throw new NotFoundException(`RelationshipManager with ID ${id} not found`);
      }

      return {
        success: true,
        message: 'RelationshipManager updated successfully',
        relationshipManager: updatedRelationshipManager.toObject() as unknown as relationshipManagerDTO,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message || 'Update failed' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteRelationshipManager(id: string) {
    try {
      const deletedRelationshipManager = await this.relationshipManager.findByIdAndDelete(id);

      if (!deletedRelationshipManager) {
        return {
          success: false,
          message: 'RelationshipManager not found',
        };
      }

      return {
        success: true,
        message: 'RelationshipManager deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error?.message || 'An error occurred while deleting the RelationshipManager',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  //role
  async createRole(role) {
    try {

      const roleCreated = await this.roles.create(role);

      if (!roleCreated) {
        return {
          success: false,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Unable to create Role',
        };
      }

      return {
        success: true,
        statusCode: HttpStatus.CREATED,
        message: 'Role created successfully',
        role: roleCreated,
      };
    } catch (e) {
      console.error("Error:", e.message);
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: e?.message || 'An error occurred',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async getAllRoles(page = 1, limit = 10, search = '') {
    try {
      const pageNumber = Math.max(1, page);
      const pageSize = Math.max(1, limit);
      const skip = (pageNumber - 1) * pageSize;
      const filter = search ? { xScoreTypeName: { $regex: search, $options: 'i' } } : {};
      const total = await this.roles.countDocuments();
      const roleList = await this.roles.find(filter).skip(skip).limit(pageSize);
      return {
        success: true,
        total,
        page: pageNumber,
        limit: pageSize,
        role: roleList,

      };
    } catch (e) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: e?.message || 'An error occurred',
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async updateRole(id: string, updateData: roleDTO): Promise<{ success: boolean; message: string; role?: roleDTO }> {
    try {
      const role = await this.roles.findById(id);
      if (!role) {
        throw new NotFoundException(`Role with ID ${id} not found`);
      }

      const updatedRole = await this.roles.findByIdAndUpdate(id, updateData, { new: true });

      if (!updatedRole) {
        throw new HttpException('Role update failed', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      const transformedRole: roleDTO = {
        name: updatedRole.name,
        permissionId: updatedRole.permissionId,
        adminId: updatedRole.adminId,
        role: updatedRole.role,
        Description: updatedRole.Description

      };


      return {
        success: true,
        message: 'Role updated successfully',
        role: transformedRole,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message || 'Update failed' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteRole(id: string) {
    try {
      const deletedRole = await this.roles.findByIdAndDelete(id);

      if (!deletedRole) {
        return {
          success: false,
          message: 'Role not found',
        };
      }

      return {
        success: true,
        message: 'Role deleted successfully',
        role: deletedRole
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error?.message || 'An error occurred while deleting the xScore',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async getRoleById(roleId: string) {
    try {
      const role = await this.roles.findById(roleId);
      if (!role) {
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Role not found',
        };
      }
      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Role details retrieved successfully',
        role,
      };
    } catch (e) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: e?.message || 'An error occurred',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

}
