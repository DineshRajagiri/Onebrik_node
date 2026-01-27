import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { attributes, AttributesDocument } from 'src/schema/attributes.schema';
import { inventoryCategory, inventoryCategoryDocument } from 'src/schema/inventoryCategory.schema';
import { SubCursor, SubCursorDocument } from 'src/schema/subcursore.schema';

@Injectable()
export class CustomerPageService {
  constructor( 
     @InjectModel(inventoryCategory.name) private inventoryCategoryModel: Model<inventoryCategoryDocument>,
     @InjectModel(SubCursor.name) private subCursorDocument: Model<SubCursorDocument>,
    ) {}
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
      return { message: 'Product view logged successfully', data: data , success:true}; ;
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
      return { message: 'Sub Header view logged successfully', data: data , success:true}; ;
    } catch (err) {
      throw err;
    }
  }

  async getAttributesByCategory(body) {
    try {
      const data = await this.subCursorDocument.insertOne(body);
      return { message: 'Attributes fetched successfully', data: data , success:true}; ;
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
      return { message: 'Sub Cursor fetched successfully', data: data , success:true}; ;
    } catch (err) {
      throw err;
    }
  }
  
}
  

