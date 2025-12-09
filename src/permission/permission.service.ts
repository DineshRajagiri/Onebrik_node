import { Injectable, HttpException, HttpStatus, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Permission, permissionDetails } from 'src/schema/permission.schema';
import { Model } from 'mongoose';
import { roles, rolesDetails } from 'src/schema/role.schema';
import { modules, modulesDetails } from 'src/schema/module.schema';
import { subModules, subModulesDetails } from 'src/schema/subModule.schema';
import { subModuleChild, subModuleChildDetails } from 'src/schema/subModuleChild.schema';
import { UpsertPermissionsForRoleDto } from './DTO/bulk-update-permission-role.dto';
import { isUUID } from 'class-validator';
import { UpsertModuleDto } from './DTO/upsert-module.dto';
import { UpsertSubModuleDto } from './DTO/upsert-sub-module.dto';
import { UpsertSubModuleChildDto } from './DTO/upsert-submodule-child-dto';

@Injectable()
export class PermissionService {

  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<permissionDetails>,
    @InjectModel(roles.name) private roleModel: Model<rolesDetails>,
    @InjectModel(modules.name) private readonly modules: Model<modulesDetails>,
    @InjectModel(subModules.name) private readonly subModules: Model<subModulesDetails>,
    @InjectModel(subModuleChild.name) private readonly subModuleChild: Model<subModuleChildDetails>
  ) { }

  private slugify(value: string): string {
    return value.trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
  }

  async upsertModule(dto: UpsertModuleDto) {
    try {
      if (!dto.title || !dto.title.trim()) {
        throw new BadRequestException('Module title is required');
      }
      const generatedKey = this.slugify(dto.title);
      if (dto.id) {
        const module = await this.modules.findById(dto.id);
        if (!module) throw new NotFoundException('Module not found');
        if (module.key !== generatedKey) {
          const exists = await this.modules.findOne({ key: generatedKey }).lean();
          if (exists) {
            throw new ConflictException(`A module with key '${generatedKey}' already exists`);
          }
        }

        module.title = dto.title.trim();
        module.key = generatedKey;
        module.icon = dto.icon ?? module.icon;
        module.sortOrder = dto.sortOrder ?? module.sortOrder;
        module.isActive = dto.isActive ?? module.isActive;
        module.updatedAt = new Date();

        await module.save();

        return {
          success: true,
          message: 'Module updated successfully',
          data: module
        };
      }
      const exists = await this.modules.findOne({ key: generatedKey }).lean();
      if (exists) {
        throw new ConflictException(`A module with key '${generatedKey}' already exists`);
      }

      const created = await this.modules.create({
        title: dto.title.trim(),
        key: generatedKey,
        icon: dto.icon || null,
        sortOrder: dto.sortOrder ?? 1,
        isActive: dto.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return {
        success: true,
        message: 'Module created successfully',
        data: created
      };

    } catch (err) {
      console.error('Error in upsertModule:', err);

      if (
        err instanceof BadRequestException ||
        err instanceof ConflictException ||
        err instanceof NotFoundException
      ) {
        throw err;
      }

      throw new HttpException(
        'Unexpected error occurred while creating/updating the module',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }


  async getPaginatedModules(page: number, limit: number): Promise<any> {
    try {
      page = Number(page);
      limit = Number(limit);

      if (!page || page < 1) page = 1;
      if (!limit || limit < 1) limit = 10;

      const skip = (page - 1) * limit;
      const filter = { isDeleted: { $ne: true } };
      const [data, total] = await Promise.all([
        this.modules
          .find(filter)
          .sort({ sortOrder: 1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        this.modules.countDocuments(filter),
      ]);

      return {
        success: true,
        message: "Modules fetched successfully",
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to fetch modules",
        error: error?.message || "Something went wrong",
      };
    }
  }



  async deleteModule(id: string) {
    try {
      if (!isUUID(id)) {
        throw new BadRequestException('Invalid module id');
      }
      const module = await this.modules.findById(id);
      if (!module) {
        throw new NotFoundException('Module not found');
      }
      const used = await this.subModules.findOne({ moduleId: id }).lean();
      if (used) {
        throw new ConflictException('Cannot delete module because submodules exist');
      }

      await this.modules.findByIdAndDelete(id);

      return {
        success: true,
        message: 'Module deleted successfully',
        data: null
      };

    } catch (err) {
      console.error('Error in deleteModule:', err);

      if (
        err instanceof BadRequestException ||
        err instanceof ConflictException ||
        err instanceof NotFoundException
      ) {
        throw err;
      }

      throw new HttpException(
        'Unexpected error occurred while deleting the module',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }


  async upsertSubModule(dto: UpsertSubModuleDto) {
    try {
      if (!isUUID(dto.moduleId)) {
        throw new NotFoundException('Invalid moduleId: Must be a valid UUID');
      }

      const parentModule = await this.modules.findById(dto.moduleId);
      if (!parentModule) {
        throw new NotFoundException('Parent module not found');
      }

      const generatedKey = this.slugify(dto.title);
      if (dto.id) {
        const existing = await this.subModules.findById(dto.id);
        if (!existing) throw new NotFoundException('SubModule not found');

        if (existing.key !== generatedKey) {
          const duplicate = await this.subModules.findOne({ key: generatedKey }).lean();
          if (duplicate) {
            throw new ConflictException(`A submodule with key '${generatedKey}' already exists`);
          }
        }

        existing.title = dto.title.trim();
        existing.key = generatedKey;
        existing.icon = dto.icon ?? existing.icon;
        existing.url = dto.url ?? existing.url;
        existing.sortOrder = dto.sortOrder ?? existing.sortOrder;
        existing.isActive = dto.isActive ?? existing.isActive;
        existing.updatedAt = new Date();

        await existing.save();

        return {
          success: true,
          message: 'Submodule updated successfully',
          data: existing
        };
      }

      const exists = await this.subModules.findOne({ key: generatedKey }).lean();
      if (exists) {
        throw new ConflictException(`A submodule with key '${generatedKey}' already exists`);
      }

      const created = await this.subModules.create({
        moduleId: dto.moduleId,
        title: dto.title.trim(),
        key: generatedKey,
        icon: dto.icon ?? null,
        url: dto.url ?? null,
        sortOrder: dto.sortOrder ?? 1,
        isActive: dto.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return {
        success: true,
        message: 'Submodule created successfully',
        data: created
      };

    } catch (err) {
      console.error('Error in upsertSubModule:', err);

      if (
        err instanceof BadRequestException ||
        err instanceof ConflictException ||
        err instanceof NotFoundException
      ) {
        throw err;
      }

      throw new HttpException(
        'Unexpected error occurred while creating/updating submodule',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

async getPaginatedSubModules(page: number, limit: number) {
  try {
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false };

    const data = await this.subModules
      .find(filter)
      .sort({ sortOrder: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await this.subModules.countDocuments(filter);

    return { data, total };

  } catch (error) {
    console.error("Submodule Fetch Error →", error);
    return { data: [], total: 0 };
  }
}



  // async getSubModules(moduleId?: string): Promise<{
  //   success: boolean;
  //   message: string;
  //   data: any[];
  // }> {
  //   try {
  //     const filter: any = {};
  //     if (moduleId) {
  //       if (!isUUID(moduleId)) {
  //         throw new BadRequestException('Invalid moduleId');
  //       }
  //       filter.moduleId = moduleId;
  //     }

  //     const submodules = await this.subModules
  //       .find(filter)
  //       .sort({ sortOrder: 1 })
  //       .lean();

  //     return {
  //       success: true,
  //       message: 'Submodules fetched successfully',
  //       data: submodules
  //     };

  //   } catch (err) {
  //     console.error('Error in getSubModules:', err);

  //     throw new HttpException(
  //       'Failed to fetch submodules',
  //       HttpStatus.INTERNAL_SERVER_ERROR
  //     );
  //   }
  // }

  async deleteSubModule(id: string): Promise<{
    success: boolean;
    message: string;
    data: null;
  }> {
    try {
      if (!isUUID(id)) {
        throw new BadRequestException('Invalid submodule id');
      }
      const submodule = await this.subModules.findById(id);
      if (!submodule) {
        throw new NotFoundException('Submodule not found');
      }
      const used = await this.subModuleChild.findOne({ subModuleId: id }).lean();
      if (used) {
        throw new ConflictException('Cannot delete submodule because child routes exist');
      }
      await this.subModules.findByIdAndDelete(id);

      return {
        success: true,
        message: 'Submodule deleted successfully',
        data: null
      };

    } catch (err) {
      console.error('Error in deleteSubModule:', err);

      if (
        err instanceof BadRequestException ||
        err instanceof ConflictException ||
        err instanceof NotFoundException
      ) {
        throw err;
      }

      throw new HttpException(
        'Failed to delete submodule',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }


  async upsertSubModuleChild(dto: UpsertSubModuleChildDto) {
    try {
      if (!isUUID(dto.subModuleId)) {
        throw new BadRequestException('Invalid subModuleId');
      }

      const parent = await this.subModules.findById(dto.subModuleId);
      if (!parent) {
        throw new NotFoundException('Parent submodule not found');
      }
      const generatedKey = this.slugify(dto.title);
      if (dto.id) {
        const existing = await this.subModuleChild.findById(dto.id);
        if (!existing) {
          throw new NotFoundException('Submodule child not found');
        }
        if (existing.key !== generatedKey) {
          const duplicate = await this.subModuleChild.findOne({ key: generatedKey }).lean();
          if (duplicate) {
            throw new ConflictException(`A child module with key '${generatedKey}' already exists`);
          }
        }
        existing.title = dto.title.trim();
        existing.key = generatedKey;
        existing.url = dto.url ?? existing.url;
        existing.sortOrder = dto.sortOrder ?? existing.sortOrder;
        existing.isActive = dto.isActive ?? existing.isActive;
        existing.updatedAt = new Date();

        await existing.save();

        return {
          success: true,
          message: 'Submodule child updated successfully',
          data: existing
        };
      }
      const exists = await this.subModuleChild.findOne({ key: generatedKey }).lean();
      if (exists) {
        throw new ConflictException(`A child module with key '${generatedKey}' already exists`);
      }

      const created = await this.subModuleChild.create({
        subModuleId: dto.subModuleId,
        title: dto.title.trim(),
        key: generatedKey,
        url: dto.url ?? null,
        sortOrder: dto.sortOrder ?? 1,
        isActive: dto.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return {
        success: true,
        message: 'Submodule child created successfully',
        data: created
      };

    } catch (err) {
      console.error('Error in upsertSubModuleChild:', err);

      if (
        err instanceof BadRequestException ||
        err instanceof ConflictException ||
        err instanceof NotFoundException
      ) {
        throw err;
      }

      throw new HttpException(
        'Unexpected error occurred while creating/updating child module',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }


  async getSubModuleChildren(subModuleId?: string): Promise<{
    success: boolean;
    message: string;
    data: any[];
  }> {
    try {
      const filter: any = {};

      if (subModuleId) {
        if (!isUUID(subModuleId)) {
          throw new BadRequestException('Invalid subModuleId');
        }
        filter.subModuleId = subModuleId;
      }

      const children = await this.subModuleChild
        .find(filter)
        .sort({ sortOrder: 1 })
        .lean();

      return {
        success: true,
        message: 'Submodule children fetched successfully',
        data: children
      };

    } catch (err) {
      console.error('Error in getSubModuleChildren:', err);

      throw new HttpException(
        'Failed to fetch submodule children',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async deleteSubModuleChild(id: string): Promise<{
    success: boolean;
    message: string;
    data: null;
  }> {
    try {
      if (!isUUID(id)) {
        throw new BadRequestException('Invalid submodule child id');
      }

      const child = await this.subModuleChild.findById(id);
      if (!child) {
        throw new NotFoundException('Submodule child not found');
      }

      await this.subModuleChild.findByIdAndDelete(id);

      return {
        success: true,
        message: 'Submodule child deleted successfully',
        data: null
      };

    } catch (err) {
      console.error('Error in deleteSubModuleChild:', err);

      throw err instanceof HttpException
        ? err
        : new HttpException(
          'Unexpected error occurred while deleting submodule child',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
  }


  async upsertPermissionsForRole(dto: UpsertPermissionsForRoleDto): Promise<{
    success: boolean;
    message: string;
    data: any[];
  }> {
    try {
      if (!isUUID(dto.roleId)) {
        throw new BadRequestException('Invalid roleId');
      }

      const role = await this.roleModel.findById(dto.roleId);
      if (!role) {
        throw new NotFoundException('Role not found');
      }
      await this.permissionModel.deleteMany({ roleId: dto.roleId });
      const docs = dto.items.map((item) => ({
        ...item,
        roleId: dto.roleId
      }));
      const created = await this.permissionModel.insertMany(docs);
      return {
        success: true,
        message: 'Permissions updated successfully',
        data: created
      };

    } catch (err) {
      console.error('Error in upsertPermissionsForRole:', err);

      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException
      ) {
        throw err;
      }

      throw new HttpException(
        'Failed to update permissions for role',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }


  async getPermissionsByRole(roleId: string): Promise<{
    success: boolean;
    message: string;
    data: any[];
  }> {
    try {
      if (!isUUID(roleId)) {
        throw new BadRequestException('Invalid roleId');
      }

      const role = await this.roleModel.findById(roleId);
      if (!role) throw new NotFoundException('Role not found');

      const list = await this.permissionModel
        .find({ roleId })
        .populate('moduleId', 'title key url icon sortOrder')
        .populate('subModuleId', 'title key url icon sortOrder')
        .populate('subModuleChildId', 'title key url sortOrder')
        .lean();

      return {
        success: true,
        message: 'Permissions fetched successfully',
        data: list
      };

    } catch (err) {
      console.error('Error in getPermissionsByRole:', err);

      throw new HttpException(
        'Failed to fetch permissions for role',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }



  async getModuleTree(): Promise<{
    success: boolean;
    message: string;
    data: any[];
  }> {
    try {
      const modules = await this.modules.find({ isActive: true }).lean();
      const subModules = await this.subModules.find({ isActive: true }).lean();
      const children = await this.subModuleChild.find({ isActive: true }).lean();

      const tree = modules.map((module) => {
        const moduleSubs = subModules.filter(
          (s) => String(s.moduleId) === String(module._id)
        );

        return {
          id: module._id,
          title: module.title,
          key: module.key,
          icon: module.icon,
          type: moduleSubs.length ? 'collapse' : 'item',
          children: moduleSubs.map((sub) => {
            const subChildren = children.filter(
              (c) => String(c.subModuleId) === String(sub._id)
            );

            return {
              id: sub._id,
              title: sub.title,
              key: sub.key,
              icon: sub.icon,
              url: sub.url,
              type: subChildren.length ? 'collapse' : 'item',
              children: subChildren.map((child) => ({
                id: child._id,
                title: child.title,
                key: child.key,
                url: child.url,
                type: 'item'
              }))
            };
          })
        };
      });

      return {
        success: true,
        message: 'Module tree fetched successfully',
        data: tree
      };

    } catch (err) {
      console.error('Error in getModuleTree:', err);

      throw new HttpException(
        'Failed to fetch RBAC module tree',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getSidebarMenu() {
    const modules = await this.modules.find({ isActive: true }).lean();
    const subModules = await this.subModules.find({ isActive: true }).lean();
    const children = await this.subModuleChild.find({ isActive: true }).lean();

    return {
      success: true,
      data: {
        masters: {
          menu: modules.map(m => ({
            id: m.key,
            title: m.title,
            type: 'item',
            key: m.key,
            url: `/admin/masters/${m.key}`
          }))
        }
      }
    };
  }

}
