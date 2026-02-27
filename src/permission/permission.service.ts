import { Injectable, HttpException, HttpStatus, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Permission, permissionDetails } from 'src/schema/permission.schema';
import { Model, modelNames } from 'mongoose';
import { roles, rolesDetails } from 'src/schema/role.schema';
import { modules, modulesDetails } from 'src/schema/module.schema';
import { subModules, subModulesDetails } from 'src/schema/subModule.schema';
import { subModuleChild, subModuleChildDetails } from 'src/schema/subModuleChild.schema';
import { GetPermissionsDto, UpsertPermissionsDto, UpsertPermissionsForRoleDto } from './DTO/bulk-update-permission-role.dto';
import { isUUID } from 'class-validator';
import { UpsertModuleDto } from './DTO/upsert-module.dto';
import { UpsertSubModuleDto } from './DTO/upsert-sub-module.dto';
import { UpsertSubModuleChildDto } from './DTO/upsert-submodule-child-dto';
import { User, UserDocument } from 'src/schema/user.schema';
import { Sidebar, SidebarDocument } from 'src/schema/sidebar.scehma';

@Injectable()
export class PermissionService {

  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<permissionDetails>,
    @InjectModel(roles.name) private roleModel: Model<rolesDetails>,
    @InjectModel(modules.name) private readonly modules: Model<modulesDetails>,
    @InjectModel(subModules.name) private readonly subModules: Model<subModulesDetails>,
    @InjectModel(subModuleChild.name) private readonly subModuleChild: Model<subModuleChildDetails>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Sidebar.name) private readonly sidebarModel: Model<SidebarDocument>,
  ) { }

  private slugify(value: string): string {
    return value.trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
  }

  async upsertModule(dto: UpsertModuleDto): Promise<any> {
    try {

      if (!dto.title || !dto.title.trim()) {
        throw new BadRequestException('Module title is required');
      }

      const generatedKey = this.slugify(dto.title);

      /* ================= UPDATE ================= */
      if (dto.id) {

        const module = await this.modules.findById(dto.id);
        if (!module) {
          throw new NotFoundException('Module not found');
        }

        if (module.key !== generatedKey) {
          const exists = await this.modules.findOne({ key: generatedKey }).lean();
          if (exists) {
            throw new ConflictException(
              `A module with key '${generatedKey}' already exists`
            );
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

      /* ================= CREATE ================= */

      const exists = await this.modules.findOne({ key: generatedKey }).lean();
      if (exists) {
        throw new ConflictException(
          `A module with key '${generatedKey}' already exists`
        );
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

  async getmodulesById(id: string) {
    try {
      const attr = await this.modules.findById(id).lean();

      if (!attr) throw new NotFoundException("modules not found");

      return {
        success: true,
        message: "modules fetched successfully",
        data: attr,
      };

    } catch (err) {
      console.error("Error in getmodulesById:", err);
      throw new HttpException("Failed to fetch modules", HttpStatus.INTERNAL_SERVER_ERROR);
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

  async getPaginatedModules(page: number, limit: number) {
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

    return { data, total, page, limit };
  }

  async getModuleDropdown() {
    const data = await this.modules
      .find({ isDeleted: { $ne: true }, isActive: true })
      .select('_id title')
      .sort({ sortOrder: 1 })
      .lean();

    return {
      success: true,
      message: 'Module dropdown fetched successfully',
      data
    };
  }




  async upsertSubModule(dto: UpsertSubModuleDto): Promise<any> {
    try {

      const parentModule = await this.modules.findById(dto.moduleId).lean();
      if (!parentModule) {
        throw new NotFoundException('Parent module does not exist');
      }

      const generatedKey = this.slugify(dto.title);
      if (dto.id) {

        const subModule = await this.subModules.findById(dto.id);
        if (!subModule) throw new NotFoundException('SubModule not found');

        if (subModule.key !== generatedKey) {
          const exists = await this.subModules.findOne({ key: generatedKey }).lean();
          if (exists) {
            throw new ConflictException(`SubModule with key '${generatedKey}' already exists`);
          }
        }

        subModule.title = dto.title.trim();
        subModule.key = generatedKey;
        subModule.icon = dto.icon ?? subModule.icon;
        subModule.url = dto.url ?? subModule.url;
        subModule.sortOrder = dto.sortOrder ?? subModule.sortOrder;
        subModule.isActive = dto.isActive ?? subModule.isActive;
        subModule.updatedAt = new Date();
        await subModule.save();
        return {
          success: true,
          message: 'SubModule updated successfully',
          data: subModule
        };
      }

      const exists = await this.subModules.findOne({ key: generatedKey }).lean();
      if (exists) {
        throw new ConflictException(`SubModule with key '${generatedKey}' already exists`);
      }

      const created = await this.subModules.create({
        moduleId: dto.moduleId,
        title: dto.title.trim(),
        key: generatedKey,
        icon: dto.icon || null,
        url: dto.url || null,
        sortOrder: dto.sortOrder ?? 1,
        isActive: dto.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return {
        success: true,
        message: 'SubModule created successfully',
        data: created
      };

    } catch (err) {
      if (
        err instanceof BadRequestException ||
        err instanceof ConflictException ||
        err instanceof NotFoundException
      ) throw err;

      throw new HttpException(
        'Unexpected error occurred while creating/updating the submodule',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getSubModuleById(id: string) {
    const subModule = await this.subModules.findById(id).lean();
    if (!subModule) throw new NotFoundException('SubModule not found');

    return {
      success: true,
      message: 'SubModule fetched successfully',
      data: subModule
    };
  }

  async deleteSubModule(id: string) {

    if (!isUUID(id)) throw new BadRequestException('Invalid submodule id');

    const subModule = await this.subModules.findById(id);
    if (!subModule) throw new NotFoundException('SubModule not found');

    await this.subModules.findByIdAndDelete(id);

    return {
      success: true,
      message: 'SubModule deleted successfully',
      data: null
    };
  }

  async getPaginatedSubModules(page: number, limit: number) {

    page = Number(page);
    limit = Number(limit);

    if (!page || page < 1) page = 1;
    if (!limit || limit < 1) limit = 10;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.subModules
        .find({ isDeleted: { $ne: true } })
        .populate('moduleId', 'title')
        .sort({ sortOrder: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.subModules.countDocuments({ isDeleted: { $ne: true } })
    ]);

    return { data, total, page, limit };
  }

  async getSubModulesByModuleId(moduleId: string) {
    try {

      if (!isUUID(moduleId)) {
        throw new BadRequestException('Invalid module id');
      }

      const subModules = await this.subModules
        .find({ moduleId, isDeleted: { $ne: true } })
        .sort({ sortOrder: 1 })
        .lean();

      return {
        success: true,
        message: 'SubModules fetched successfully',
        data: subModules
      };

    } catch (err) {

      if (
        err instanceof BadRequestException
      ) {
        throw err;
      }

      throw new HttpException(
        'Failed to fetch submodules',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getSubModuleDropdown(moduleId?: string) {

    const filter: any = {
      isDeleted: { $ne: true },
      isActive: true
    };

    if (moduleId) {
      filter.moduleId = moduleId;
    }

    const data = await this.subModules
      .find(filter)
      .select('_id title moduleId')
      .sort({ sortOrder: 1 })
      .lean();

    return {
      success: true,
      message: 'SubModule dropdown fetched successfully',
      data
    };
  }



  async upsertSubModuleChild(dto: UpsertSubModuleChildDto) {

    const parent = await this.subModules.findById(dto.subModuleId);
    if (!parent) {
      throw new NotFoundException('Parent submodule not found');
    }

    const generatedKey = this.slugify(dto.title);

    if (dto.id) {
      const existing = await this.subModuleChild.findById(dto.id);
      if (!existing) {
        throw new NotFoundException('SubModuleChild not found');
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
        message: 'SubModuleChild updated successfully',
        data: existing
      };
    }

    const created = await this.subModuleChild.create({
      subModuleId: dto.subModuleId,
      moduleId: parent.moduleId,
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
      message: 'SubModuleChild created successfully',
      data: created
    };
  }

  async getPaginatedSubModuleChild(page: number, limit: number) {

    page = Number(page);
    limit = Number(limit);

    if (!page || page < 1) page = 1;
    if (!limit || limit < 1) limit = 10;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.subModuleChild
        .find({ isDeleted: { $ne: true } })
        .sort({ sortOrder: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.subModuleChild.countDocuments({ isDeleted: { $ne: true } })
    ]);

    return { data, total, page, limit };
  }


  async getSubModuleChildById(id: string) {

    const child = await this.subModuleChild.findById(id).lean();
    if (!child) throw new NotFoundException('SubModuleChild not found');

    return {
      success: true,
      message: 'SubModuleChild fetched successfully',
      data: child
    };
  }


  async deleteSubModuleChild(id: string) {

    if (!isUUID(id)) {
      throw new BadRequestException('Invalid id');
    }

    const child = await this.subModuleChild.findById(id);
    if (!child) {
      throw new NotFoundException('SubModuleChild not found');
    }

    await this.subModuleChild.findByIdAndDelete(id);

    return {
      success: true,
      message: 'SubModuleChild deleted successfully',
      data: null
    };
  }

  async getSubModuleChildrenBySubModuleId(subModuleId: string) {

    if (!isUUID(subModuleId)) {
      throw new BadRequestException('Invalid subModuleId');
    }

    const list = await this.subModuleChild
      .find({ subModuleId, isDeleted: { $ne: true } })
      .sort({ sortOrder: 1 })
      .lean();

    return {
      success: true,
      message: 'SubModuleChildren fetched successfully',
      data: list
    };
  }

  async getSubModuleChildDropdown(subModuleId?: string) {

    const filter: any = {
      isDeleted: { $ne: true },
      isActive: true
    };

    if (subModuleId) {
      filter.subModuleId = subModuleId;
    }

    const data = await this.subModuleChild
      .find(filter)
      .select('_id title subModuleId')
      .sort({ sortOrder: 1 })
      .lean();

    return {
      success: true,
      message: 'SubModuleChild dropdown fetched successfully',
      data
    };
  }





  async getList(entity: string) {
    const collections = {
      modules: this.modules,
      submodules: this.subModules,
      roles: this.roleModel,
      subModuleChild: this.subModuleChild
    };

    const model = collections[entity];

    if (!model) {
      throw new BadRequestException(`Unknown list entity: ${entity}`);
    }

    const data = await model
      .find({ isDeleted: { $ne: true } })
      .select({ title: 1, name: 1, _id: 1 })
      .sort({ sortOrder: 1 })
      .lean();

    return data;
  }


  async upsertPermissionsForRole(dto: UpsertPermissionsForRoleDto) {

    if (!isUUID(dto.roleId)) {
      throw new BadRequestException('Invalid roleId');
    }

    const role = await this.roleModel.findById(dto.roleId);
    if (!role) throw new NotFoundException('Role not found');

    await this.permissionModel.deleteMany({ roleId: dto.roleId });

    const docs = [];

    for (const item of dto.items) {

      let moduleId: string | null = null;
      let subModuleId: string | null = null;
      let subModuleChildId: string | null = null;

      // CHILD LEVEL
      if (item.subModuleChildId) {
        const child = await this.subModuleChild.findById(item.subModuleChildId);
        if (!child) continue;

        subModuleChildId = child._id;
        subModuleId = child.subModuleId;
        moduleId = child.moduleId;
      }

      // SUBMODULE LEVEL
      else if (item.subModuleId) {
        const subModule = await this.subModules.findById(item.subModuleId);
        if (!subModule) continue;

        subModuleId = subModule._id;
        moduleId = subModule.moduleId;
      }

      // MODULE LEVEL
      else if (item.moduleId) {
        const module = await this.modules.findById(item.moduleId);
        if (!module) continue;

        moduleId = module._id;
      }

      if (!moduleId) continue;

      docs.push({
        roleId: dto.roleId,          // UUID
        moduleId,                   // UUID
        subModuleId,                // UUID
        subModuleChildId,           // UUID
        canView: Boolean(item.canView),
        canCreate: Boolean(item.canCreate),
        canUpdate: Boolean(item.canUpdate),
        canDelete: Boolean(item.canDelete)
      });
    }

    if (!docs.length) {
      throw new BadRequestException('No valid permissions to insert');
    }

    const created = await this.permissionModel.insertMany(docs);

    return {
      success: true,
      message: 'Permissions updated successfully',
      data: created
    };
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
          // icon: module.icon,
          type: moduleSubs.length ? 'group' : 'item',
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

  async getSidebarForUser(userId: string) {

    const user = await this.userModel.findById(userId).lean();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 1️⃣ Load full module tree
    const moduleTreeResponse = await this.getModuleTree();
    const moduleTree = moduleTreeResponse.data;

    // 2️⃣ Load permissions
    const permissions = await this.permissionModel.find({
      roleId: user.roleId,
      canView: true,
    }).lean();

    if (!permissions.length) {
      return [];
    }

    // 3️⃣ Collect allowed IDs
    const allowedIds = new Set<string>();

    permissions.forEach(p => {
      if (p.moduleId) allowedIds.add(p.moduleId.toString());
      if (p.subModuleId) allowedIds.add(p.subModuleId.toString());
      if (p.subModuleChildId) allowedIds.add(p.subModuleChildId.toString());
    });

    const filterTree = (nodes: any[]): any[] =>
      nodes
        .map(node => {
          const nodeId = node.id || node._id;

          const children = node.children?.length
            ? filterTree(node.children)
            : [];

          if (!allowedIds.has(nodeId) && children.length === 0) {
            return null;
          }

          return { ...node, children };
        })
        .filter(Boolean);

    return filterTree(moduleTree);
  }

  async getsidebarForadmin(): Promise<any> {
    try {
      const moduleTreeResponse = await this.sidebarModel.find()
      return {
        success: true,
        data: moduleTreeResponse,
        message: 'Sidebar loaded successfully'
      };
    } catch (err) {
      console.error(err);
    }
  }
  async givePermissions(data: any) {
    const user = await this.userModel.findById(data.userId).lean();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const docs = data.permissions.map((item: any) => ({
      roleId: user.roleId,
      userId: user?._id || '',
      moduleId: item.moduleId || null,
      subModuleId: item.subModuleId || null,
      subModuleChildId: item.subModuleChildId || null,
      canView: Boolean(item.canView),
      canCreate: Boolean(item.canCreate),
      canUpdate: Boolean(item.canUpdate),
      canDelete: Boolean(item.canDelete)
    }));
    await this.permissionModel.deleteMany({ userId: user._id });
    await this.permissionModel.insertMany(docs);
  }

  async getu(userId: string): Promise<any[]> {
    const user = await this.userModel.findById(userId).lean();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const permissions = await this.permissionModel.find({ userId: user._id }).lean();
    return permissions;
  }


  async upsertPermissions(dto: UpsertPermissionsDto) {

    if (!isUUID(dto.roleId)) {
      throw new BadRequestException('Invalid roleId');
    }

    const role = await this.roleModel.findById(dto.roleId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    let user = null;
    if (dto.userId) {

      if (!isUUID(dto.userId)) {
        throw new BadRequestException('Invalid userId');
      }

      user = await this.userModel.findById(dto.userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (String(user.roleId) !== String(dto.roleId)) {
        throw new BadRequestException('User does not belong to given role');
      }

      await this.permissionModel.deleteMany({ userId: dto.userId });
    }
    else {
      await this.permissionModel.deleteMany({
        roleId: dto.roleId,
        userId: null
      });
    }

    const docs = [];

    for (const item of dto.items) {

      let moduleId: string | null = null;
      let subModuleId: string | null = null;
      let subModuleChildId: string | null = null;

      if (item.subModuleChildId) {
        const child = await this.subModuleChild.findById(item.subModuleChildId);
        if (!child) continue;

        subModuleChildId = child._id;
        subModuleId = child.subModuleId;
        moduleId = child.moduleId;
      }

      else if (item.subModuleId) {
        const subModule = await this.subModules.findById(item.subModuleId);
        if (!subModule) continue;

        subModuleId = subModule._id;
        moduleId = subModule.moduleId;
      }


      else if (item.moduleId) {
        const module = await this.modules.findById(item.moduleId);
        if (!module) continue;

        moduleId = module._id;
      }

      if (!moduleId) continue;

      docs.push({
        roleId: dto.roleId,
        userId: dto.userId ?? null,
        moduleId,
        subModuleId,
        subModuleChildId,
        canView: Boolean(item.canView),
        canCreate: Boolean(item.canCreate),
        canUpdate: Boolean(item.canUpdate),
        canDelete: Boolean(item.canDelete)
      });
    }

    if (!docs.length) {
      throw new BadRequestException('No valid permissions to insert');
    }

    const created = await this.permissionModel.insertMany(docs);

    return {
      success: true,
      message: dto.userId
        ? 'User permissions updated successfully'
        : 'Role permissions updated successfully',
      data: created
    };
  }

  async getPermissions(dto: GetPermissionsDto) {

    if (!isUUID(dto.roleId)) {
      throw new BadRequestException('Invalid roleId format');
    }

    const role = await this.roleModel.findOne({
      _id: dto.roleId,
      isDeleted: { $ne: true }
    }).lean();

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    let filter: any = {
      roleId: dto.roleId,
      userId: dto.userId ?? null
    };

    if (dto.userId) {
      if (!isUUID(dto.userId)) {
        throw new BadRequestException('Invalid userId format');
      }

      const user = await this.userModel.findOne({
        _id: dto.userId,
        isDeleted: { $ne: true }
      }).lean();

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.roleId !== dto.roleId) {
        throw new BadRequestException('User does not belong to this role');
      }

      const userPermissions = await this.permissionModel
        .find(filter)
        .populate('moduleId', 'title')
        .populate('subModuleId', 'title')
        .populate('subModuleChildId', 'title')
        .lean();

      if (userPermissions.length > 0) {
        return {
          success: true,
          message: 'User permissions fetched successfully',
          data: this.mapPermissions(userPermissions)
        };
      }
    }

    const rolePermissions = await this.permissionModel
      .find({
        roleId: dto.roleId,
        userId: null
      })
      .populate('moduleId', 'title')
      .populate('subModuleId', 'title')
      .populate('subModuleChildId', 'title')
      .lean();

    return {
      success: true,
      message: 'Role permissions fetched successfully',
      data: this.mapPermissions(rolePermissions)
    };
  }
  private mapPermissions(list: any[]) {
    return list.map(p => ({
      _id: p._id,
      roleId: p.roleId,
      userId: p.userId,

      moduleId: p.moduleId?._id || p.moduleId,
      moduleTitle: p.moduleId?.title || null,

      subModuleId: p.subModuleId?._id || p.subModuleId,
      subModuleTitle: p.subModuleId?.title || null,

      subModuleChildId: p.subModuleChildId?._id || p.subModuleChildId,
      subModuleChildTitle: p.subModuleChildId?.title || null,

      canView: p.canView,
      canCreate: p.canCreate,
      canUpdate: p.canUpdate,
      canDelete: p.canDelete,

      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    }));
  }
}
