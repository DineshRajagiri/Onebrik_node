import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { moduleDTO } from './DTO/module.dto';
import { InjectModel } from '@nestjs/mongoose';
import { modules, modulesDetails } from 'src/schema/module.schema';
import { Model } from 'mongoose';
import { subModules, subModulesDetails } from 'src/schema/subModule.schema';
import { subModuleChild, subModuleChildDetails } from 'src/schema/subModuleChild.schema';
import { subModuleDTO } from './DTO/submodule.dto';
import { subModuleChildDTO } from './DTO/subModuleChild.dto';

@Injectable()
export class RbacService {

    constructor(
        @InjectModel(modules.name) private readonly modules: Model<modulesDetails>,
        @InjectModel(subModules.name) private readonly subModules: Model<subModulesDetails>,
        @InjectModel(subModuleChild.name) private readonly subModuleChild: Model<subModuleChildDetails>
    ) { }
    //Module Section
    async createModule(data: moduleDTO) {
        try {
            // Check if module already exists
            const exists = await this.modules.findOne({
                $or: [{ key: data.key }, { title: data.title }]
            });

            if (exists) {
                return {
                    success: false,
                    statusCode: HttpStatus.CONFLICT,
                    message: "Module already exists"
                };
            }

            // Create module
            const createdModule = await this.modules.create(data);

            return {
                success: true,
                statusCode: HttpStatus.CREATED,
                message: "Module created successfully",
                module: createdModule
            };

        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: error?.message || "Something went wrong"
                },
                HttpStatus.BAD_REQUEST
            );
        }
    }

    //SubModule Section

    async createSubModule(data: subModuleDTO) {
        try {
            const exist = await this.subModules.findOne({
                $or: [{ key: data.key }, { title: data.title }],
            });

            if (exist) {
                return {
                    success: false,
                    statusCode: HttpStatus.CONFLICT,
                    message: "Submodule already exists",
                };
            }

            const created = await this.subModules.create(data);

            return {
                success: true,
                statusCode: HttpStatus.CREATED,
                message: "Submodule created successfully",
                submodule: created,
            };

        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: error?.message || "Something went wrong",
                },
                HttpStatus.BAD_REQUEST
            );
        }
    }

     //SubModuleChild Section
    async createSubModuleChild(data: subModuleChildDTO) {
  try {
    const exist = await this.subModuleChild.findOne({
      $or: [{ key: data.key }, { title: data.title }],
      subModuleId: data.subModuleId
    });

    if (exist) {
      return {
        success: false,
        statusCode: HttpStatus.CONFLICT,
        message: "Child entry already exists",
      };
    }

    const created = await this.subModuleChild.create(data);

    return {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: "Submodule child created successfully",
      submoduleChild: created,
    };

  } catch (error) {
    throw new HttpException(
      {
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: error?.message || "Something went wrong",
      },
      HttpStatus.BAD_REQUEST
    );
  }
}




}
