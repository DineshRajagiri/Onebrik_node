import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { admin, adminDetails } from 'src/schema/admin.schema';
import { modules, modulesDetails } from 'src/schema/module.schema';
import { permission, permissionDetails } from 'src/schema/permission.schema';
import { roles, rolesDetails } from 'src/schema/role.schema';
import { subModules, subModulesDetails } from 'src/schema/subModule.schema';
import { subModuleChild, subModuleChildDetails } from 'src/schema/subModuleChild.schema';
import { Roles } from 'src/utils/constants';
import { moduleDTO } from './DTO/module.dto';
import { subModuleDTO } from './DTO/subModule.dto';
import { subModuleChildDTO } from './DTO/subModuleChild.dto';
import { AssignPermissionsDto } from './DTO/permission.dto';
import { roleDTO } from './DTO/role.dto';

@Injectable()
export class SidebarService {

  constructor(
    @InjectModel(modules.name) private readonly modules: Model<modulesDetails>,
    @InjectModel(subModules.name) private readonly subModules: Model<subModulesDetails>,
    @InjectModel(subModuleChild.name) private readonly subModuleChild: Model<subModuleChildDetails>,
    @InjectModel(permission.name) private permission: Model<permissionDetails>,
    @InjectModel(roles.name) private roles: Model<rolesDetails>,
    @InjectModel(admin.name) private admin: Model<adminDetails>,

  ) { }

  //module//
  async createModules(modules) {
    try {
      const exist = await this.modules.findOne({
        title: modules?.title,
      });

      if (exist) {
        return {
          success: false,
          statusCode: HttpStatus.CONFLICT, // 409 Conflict
          message: 'Module already exist',
        };
      }

      const modulesCreated = await this.modules.create(modules);
      if (!modulesCreated) {
        return {
          success: false,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR, // 500 Internal Server Error
          message: 'Unable to create module',
        };
      }

      return {
        success: true,
        statusCode: HttpStatus.CREATED, // 201 Created
        message: 'Module created successfully',
        modules: modulesCreated,
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
  async getAllModules(page = 1, limit = 10, search = '') {
    try {
      const pageNumber = Math.max(1, page);
      const pageSize = Math.max(1, limit);
      const skip = (pageNumber - 1) * pageSize;

      // Search filter
      const filter = search ? { title: { $regex: search, $options: 'i' } } : {};

      // Get total count
      const total = await this.modules.countDocuments(filter);

      // Fetch and sort modules by "order"
      const sidebarList = await this.modules
        .find(filter)
        .sort({ order: 1 }) // Sorts in ascending order (1 for ASC, -1 for DESC)
        .skip(skip)
        .limit(pageSize);

      return {
        success: true,
        total,
        page: pageNumber,
        limit: pageSize,
        modules: sidebarList,
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


  async modulesList() {
    try {
      const modules = await this.modules.find({}, { _id: 1, title: 1 });
      if (!modules || modules.length === 0) {
        throw new HttpException(
          {
            success: false,
            statusCode: HttpStatus.NOT_FOUND,
            message: 'No modules found',
          },
          HttpStatus.NOT_FOUND
        );
      }

      return {
        success: true,
        message: 'Module List',
        modules,
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


  async updateModule(id: string, updateData: moduleDTO): Promise<{ success: boolean; message: string; module?: moduleDTO }> {
    try {
      const existingModule = await this.modules.findById(id);
      if (!existingModule) {
        throw new NotFoundException(`Module with ID ${id} not found`);
      }

      const updatedModule = await this.modules.findByIdAndUpdate(id, updateData, { new: true });

      return {
        success: true,
        message: 'Module updated successfully',
        module: updatedModule,
      };

    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message || 'Update failed' },
        HttpStatus.BAD_REQUEST
      );
    }
  }


  async deleteModule(id: string) {
    try {
      const deletedModule = await this.modules.findByIdAndDelete(id);

      if (!deletedModule) {
        return {
          success: false,
          message: 'Module not found',
        };
      }

      return {
        success: true,
        message: 'Module deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error?.message || 'An error occurred while deleting the module',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getModuleById(moduleId: string) {
    try {
      const module = await this.modules.findById(moduleId);
      if (!module) {
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Module not found',
        };
      }
      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Module details retrieved successfully',
        module,
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

  //sub module//
  async getAllSubModules(page = 1, limit = 10, search = '') {
    try {
      const pageNumber = Math.max(1, page);
      const pageSize = Math.max(1, limit);
      const skip = (pageNumber - 1) * pageSize;

      // Search filter
      const filter = search ? { title: { $regex: search, $options: 'i' } } : {};

      // Get total count
      const total = await this.subModules.countDocuments(filter);

      // Fetch and sort submodules by "order"
      const sidebarList = await this.subModules
        .find(filter)
        .sort({ order: 1 }) // Sorting in ascending order
        .skip(skip)
        .limit(pageSize);

      return {
        success: true,
        total,
        page: pageNumber,
        limit: pageSize,
        subModules: sidebarList,
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

  async getSubModuleById(subModuleId: string) {
    try {
      const Submodule = await this.subModules.findById(subModuleId);
      if (!Submodule) {
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Sub Module not found',
        };
      }
      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Sub Module details retrieved successfully',
        Submodule,
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

  async createsubmodules(submodules) {
    try {
      const exist = await this.subModules.findOne({ title: submodules?.title });
      if (exist) {
        return {
          success: false,
          message: 'Submodule already exists',
        };
      }

      // Set breadcrumbs and children based on type
      if (submodules?.type.toLowerCase() === 'item') {
        submodules.breadcrumbs = true;
        submodules.children = false;
      } else if (submodules?.type.toLowerCase() === 'collapse') {
        submodules.breadcrumbs = false;
        submodules.children = true;
      }

      // Set URL only for 'item' type
      submodules.url = submodules?.type.toLowerCase() === 'item'
        ? `/${submodules.title.trim().toLowerCase().replace(/\s+/g, '-')}`
        : '';

      const submodulesCreated = await this.subModules.create(submodules);
      if (!submodulesCreated) {
        return {
          success: false,
          message: 'Unable to create submodule',
        };
      }

      return {
        success: true,
        message: 'Submodule created successfully',
        submodules: submodulesCreated,
      };
    } catch (e) {
      throw new HttpException(
        { success: false, message: e?.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async updateSubModule(id: string, updateData: subModuleDTO): Promise<{ success: boolean; message: string; subModule?: subModuleDTO }> {
    const subModule = await this.subModules.findById(id);
    if (!subModule) {
      throw new NotFoundException(`SubModule with ID ${id} not found`);
    }

    const updatedSubModule = await this.subModules.findByIdAndUpdate(id, updateData, { new: true });

    return {
      success: true,
      message: 'SubModule updated successfully',
      subModule: updatedSubModule,
    };
  }
  async deleteSubModule(id: string): Promise<{ success: boolean; message: string }> {
    const subModule = await this.subModules.findById(id);

    if (!subModule) {
      throw new NotFoundException(`SubModule with ID ${id} not found`);
    }

    await this.subModules.findByIdAndDelete(id);

    return {
      success: true,
      message: 'SubModule deleted successfully',
    };
  }

  //sub Child Module//
  async getAllSubChildModules(page = 1, limit = 10, search = '') {
    try {
      const pageNumber = Math.max(1, page);
      const pageSize = Math.max(1, limit);
      const skip = (pageNumber - 1) * pageSize;

      // Search filter
      const filter = search ? { title: { $regex: search, $options: 'i' } } : {};

      // Get total count
      const total = await this.subModuleChild.countDocuments(filter);

      // Fetch and sort subchild modules by "order"
      const sidebarList = await this.subModuleChild
        .find(filter)
        .sort({ order: 1 }) // Sorting in ascending order
        .skip(skip)
        .limit(pageSize);

      return {
        success: true,
        statusCode: HttpStatus.OK, // 200 OK
        message: 'Sub-child modules retrieved successfully',
        total,
        page: pageNumber,
        limit: pageSize,
        subModuleChild: sidebarList,
      };
    } catch (e) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST, // 400 Bad Request
          message: e?.message || 'An error occurred',
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async createsubmoduleChild(submoduleChild: subModuleChildDTO) {
    try {
      const exist = await this.subModuleChild.findOne({ title: submoduleChild?.title });

      if (exist) {
        return {
          success: false,
          message: 'Submodule child already exists',
        };
      }

      // Set default values
      submoduleChild.type = 'item'; // Default type
      submoduleChild.breadcrumbs = 'item'; // Default breadcrumbs
      submoduleChild.children = null;
      submoduleChild.icon = null; // Default children to null

      // Set URL only for 'collapse' type
      submoduleChild.url = submoduleChild.type.toLowerCase() === 'item'
        ? `/${submoduleChild.title.trim().toLowerCase().replace(/\s+/g, '-')}`
        : '';

      const submoduleChildCreated = await this.subModuleChild.create(submoduleChild);

      if (!submoduleChildCreated) {
        return {
          success: false,
          message: 'Unable to create submodule child',
        };
      }

      return {
        success: true,
        message: 'Submodule child created successfully',
        submoduleChild: submoduleChildCreated,
      };
    } catch (e) {
      throw new HttpException(
        { success: false, message: e?.message || 'An error occurred while creating submodule child' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async updateSubModuleChild(id: string, updateData: subModuleChildDTO): Promise<{ success: boolean; message: string; subModuleChild?: subModuleChildDTO }> {
    const subModuleChild = await this.subModuleChild.findById(id);

    if (!subModuleChild) {
      throw new NotFoundException(`SubModuleChild with ID ${id} not found`);
    }

    // Update the fields
    subModuleChild.title = updateData.title;
    subModuleChild.type = updateData.type;
    subModuleChild.icon = updateData.icon;
    subModuleChild.children = updateData.children;
    subModuleChild.order = updateData.order;
    subModuleChild.url = updateData.url;
    subModuleChild.subModuleId = updateData.subModuleId;

    await subModuleChild.save();

    return {
      success: true,
      message: 'SubModuleChild updated successfully',
      subModuleChild,
    };
  }
  async deleteSubModuleChild(id: string): Promise<{ success: boolean; message: string }> {
    const subModuleChild = await this.subModuleChild.findById(id);

    if (!subModuleChild) {
      throw new NotFoundException(`SubModuleChild with ID ${id} not found`);
    }

    await this.subModuleChild.findByIdAndDelete(id);

    return {
      success: true,
      message: 'SubModuleChild deleted successfully',
    };
  }
  async getSubModuleChildById(subModuleChildId: string) {
    try {
      const submodulechild = await this.subModuleChild.findById(subModuleChildId);
      if (!submodulechild) {
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Sub Module child not found',
        };
      }
      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Sub Module child details retrieved successfully',
        submodulechild,
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


  //Permissions//
  async createPermission(permission) {
    try {
      const { name,
        isAdd,
        isRead,
        isUpdate,
        isDelete,
        moduleIds } = permission;
      const exist = await this.permission.findOne({ name });
      if (exist) {
        return {
          success: false,
          message: 'permission alread Exist',
        };
      }
      let permissionObject = {
        name,
        isAdd,
        isRead,
        isUpdate,
        isDelete,
        moduleIds
      }

      const permissionCreated = await this.permission.create(permissionObject);
      if (!permissionCreated) {
        return {
          success: false,
          message: 'Unable to create permission',
        };
      }
      return {
        success: true,
        message: 'permission created successfully',
        permission: permissionCreated,
      };
    } catch (e) {
      throw new HttpException(
        { success: false, message: e?.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getAllPermissions(page = 1, limit = 10, search = '') {
    try {
      const pageNumber = Math.max(1, page);
      const pageSize = Math.max(1, limit);
      const skip = (pageNumber - 1) * pageSize;

      // Search filter (case-insensitive search by name)
      const filter = search ? { name: { $regex: search, $options: 'i' } } : {};

      const [permissions, total] = await Promise.all([
        this.permission.find(filter).skip(skip).limit(pageSize),
        this.permission.countDocuments(filter),
      ]);

      return {
        success: true,
        total,
        page: pageNumber,
        limit: pageSize,
        permissions,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // async updatePermission(id: string, updateData: permissionDTO): Promise<{ success: boolean; message: string; permission?: permissionDTO }> {
  //   try {
  //     const permission = await this.permission.findById(id);

  //     if (!permission) {
  //       throw new NotFoundException(`Permission with ID ${id} not found`);
  //     }

  //     const updatedPermission = await this.permission.findByIdAndUpdate(id, updateData, { new: true });

  //     return {
  //       success: true,
  //       message: 'Permission updated successfully',
  //       permission: updatedPermission,
  //     };
  //   } catch (error) {
  //     throw new HttpException(
  //       { success: false, message: error.message || 'Update failed' },
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  // }

  async deletePermission(id: string) {
    try {
      const permission = await this.permission.findById(id);

      if (!permission) {
        return { success: false, message: 'Permission not found' };
      }

      await this.permission.findByIdAndDelete(id);

      return {
        success: true,
        message: 'Permission deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async getPermissionById(permissionId: string) {
    try {
      const permission = await this.permission.findById(permissionId);
      if (!permission) {
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'permission not found',
        };
      }
      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'permission details retrieved successfully',
        permission,
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
  //Roles//
  async createRoles(roles) {
    try {
      const { name, permissionId, adminId, role } = roles;
      const exist = await this.roles.findOne({ adminId });
      if (exist) {
        return {
          success: false,
          message: 'Role already exists',
        };
      }
      let rolesObject = {
        name,
        permissionId,
        adminId,
        role
      };
      const rolesCreated = await this.roles.create(rolesObject);
      if (!rolesCreated) {
        return {
          success: false,
          message: 'Unable to create role',
        };
      }
      return {
        success: true,
        message: 'Role created successfully',
        roles: rolesCreated,
      };
    } catch (e) {
      throw new HttpException(
        { success: false, message: e?.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getAllRoles(page = 1, limit = 10, search = '') {
    try {
      const pageNumber = Math.max(1, page);
      const pageSize = Math.max(1, limit);
      const skip = (pageNumber - 1) * pageSize;
      const filter = search ? { name: { $regex: search, $options: 'i' } } : {};
      const total = await this.roles.countDocuments(filter);
      const roles = await this.roles.find(filter).populate('permissionId').skip(skip).limit(pageSize);

      return {
        success: true, total, page: pageNumber, limit: pageSize, roles,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async updateRole(id: string, updateData: Partial<roleDTO>): Promise<{ success: boolean; message: string; role?: roleDTO }> {
    try {
      const role = await this.roles.findById(id);

      if (!role) {
        throw new NotFoundException(`Role with ID ${id} not found`);
      }

      const updatedRole = await this.roles.findByIdAndUpdate(id, updateData, { new: true });

      if (!updatedRole) {
        throw new HttpException('Role update failed', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return {
        success: true,
        message: 'Role updated successfully',
        role: updatedRole.toObject() as unknown as roleDTO,
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
      const role = await this.roles.findById(id);
      if (!role) {
        throw new HttpException(
          { success: false, message: 'Role not found' },
          HttpStatus.NOT_FOUND,
        );
      }

      await this.roles.findByIdAndDelete(id);

      return {
        success: true,
        message: 'Role deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async getRoleById(rolesId: string) {
    try {
      const roles = await this.roles.findById(rolesId);
      if (!roles) {
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'roles not found',
        };
      }
      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'roles details retrieved successfully',
        roles,
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


  //side bar//
  // async getSidebarForAdmin(userId: string) {
  //   try {
  //     const user = await this.admin.findOne({ _id: userId });
  //     if (!user) {
  //       return { success: false, message: 'User not found' };
  //     }

  //     const role = await this.roles.findOne({ role: user.role });
  //     if (!role) {
  //       return { success: false, message: 'Role not found' };
  //     }

  //     let modules;

  //     if (role.role === Roles.SUPERADMIN) {
  //       // Fetch all modules for SUPERADMIN
  //       modules = await this.modules.find({});
  //       if (!modules || modules.length === 0) {
  //         return { success: false, message: 'No modules available for SUPERADMIN' };
  //       }
  //     } else {
  //       // Fetch modules based on permissions for non-SUPERADMIN roles
  //       const permissions = await this.permission.findOne({ _id: role.permissionId });
  //       if (!permissions) {
  //         return { success: false, message: 'Permissions not found' };
  //       }

  //       const allowedModuleIds = permissions.moduleIds;
  //       modules = await this.modules.find({ _id: { $in: allowedModuleIds } });
  //       if (!modules || modules.length === 0) {
  //         return { success: false, message: 'Modules not found' };
  //       }
  //     }

  //     // Fetch sidebar data including submodules and submodule children
  //     const sidebar = await Promise.all(
  //       modules.map(async (module) => {
  //         const subModules = await this.subModules.find({ modulesId: module._id });

  //         const subModuleDetails = await Promise.all(
  //           subModules.map(async (subModule) => {
  //             const subModuleChildren = await this.subModuleChild.find({ subModuleId: subModule._id });

  //             const subModuleChildDetails = subModuleChildren.map((child) => ({
  //               id: child._id,
  //               title: child.title,
  //               type: child.type,
  //               url: child.url,
  //               // order: child.order
  //               // target: true,
  //               // breadcrumbs: false,
  //             }));

  //             return {
  //               id: subModule._id,
  //               title: subModule.title,
  //               type: subModule.type,
  //               children: subModuleChildDetails,
  //               url: subModule.url,
  //               icon: subModule.icon,
  //               order: subModule.order
  //             };
  //           })
  //         );

  //         return {
  //           id: module._id,
  //           title: module.title,
  //           type: module.type,
  //           icon: module.icon || '#default-icon',
  //           order: module.order,
  //           children: subModuleDetails,
  //         };
  //       })
  //     );

  //     return {
  //       success: true,
  //       data: {
  //         menus: sidebar,
  //       },
  //     };
  //   } catch (error) {
  //     throw new HttpException(
  //       { success: false, message: error.message || 'Failed to retrieve sidebar data' },
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  // }

  async getSidebarForAdmin(userId: string) {
    try {

      const user = await this.admin.findOne({ _id: userId });
      if (!user) {
        return { success: false, message: 'User not found' };
      }


      const permissionData = await this.permission.findOne({ adminId: userId });


      const modules = await this.modules.find({});
      if (!modules.length) return { success: false, message: 'No modules found' };


      const sidebar = await Promise.all(
        modules.map(async (module) => {

          const modulePermissions = permissionData?.permissions.find(p => p.modulesId === module._id.toString());


          const subModules = await this.subModules.find({ modulesId: module._id });

          const subModuleDetails = await Promise.all(
            subModules.map(async (subModule) => {

              const subModulePermissions = permissionData?.permissions.find(p => p.subModuleId === subModule._id.toString());


              const subModuleChildren = await this.subModuleChild.find({ subModuleId: subModule._id });

              const subModuleChildDetails = subModuleChildren.map((child) => {

                const subModuleChildPermissions = permissionData?.permissions.find(p => p.subModuleChildId === child._id.toString());

                return {
                  id: child._id,
                  title: child.title,
                  type: child.type,
                  url: child.url,
                  isAdd: subModuleChildPermissions?.isAdd || false,
                  isEdit: subModuleChildPermissions?.isEdit || false,
                  isDelete: subModuleChildPermissions?.isDelete || false,
                  isRead: subModuleChildPermissions?.isRead || false,
                };
              });

              return {
                id: subModule._id,
                title: subModule.title,
                type: subModule.type,
                children: subModuleChildDetails,
                url: subModule.url,
                icon: subModule.icon,
                order: subModule.order,
                isAdd: subModulePermissions?.isAdd || false,
                isEdit: subModulePermissions?.isEdit || false,
                isDelete: subModulePermissions?.isDelete || false,
                isRead: subModulePermissions?.isRead || false,
              };
            })
          );

          return {
            id: module._id,
            title: module.title,
            type: module.type,
            icon: module.icon || '#default-icon',
            order: module.order,
            children: subModuleDetails,
            isAdd: modulePermissions?.isAdd || false,
            isEdit: modulePermissions?.isEdit || false,
            isDelete: modulePermissions?.isDelete || false,
            isRead: modulePermissions?.isRead || false,
          };
        })
      );

      return {
        success: true,
        data: {
          menus: sidebar,
        },
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message || 'Failed to retrieve sidebar data' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async assignPermissions(assignPermissionsDto: AssignPermissionsDto) {
    try {
      const { adminId, permissions } = assignPermissionsDto;

      const adminExists = await this.admin.findOne({ _id: adminId });
      if (!adminExists) {
        throw new HttpException('Admin not found', HttpStatus.NOT_FOUND);
      }

      const permissionData = permissions.map((perm) => ({
        modulesId: perm.modulesId,
        subModuleId: perm.subModuleId || null,
        subModuleChildId: perm.subModuleChildId || null,
        isAdd: perm.isAdd,
        isEdit: perm.isEdit,
        isDelete: perm.isDelete,
        isRead: perm.isRead,
      }));

      await this.permission.updateOne(
        { adminId },
        { $set: { permissions: permissionData } },
        { upsert: true }
      );

      return { success: true, message: 'Permissions assigned successfully' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getAllModulesWithDefaultPermissions() {
    try {

      const modules = await this.modules.find().lean();
      const subModules = await this.subModules.find().lean();
      const subChildModules = await this.subModuleChild.find().lean();


      const formattedModules = modules.map(module => ({
        id: module._id,
        title: module.title,
        type: module.type,
        icon: module.icon || 'Icon',
        isAdd: false,
        isEdit: false,
        isDelete: false,
        isRead: false,
        children: subModules
          .filter(sub => String(sub.modulesId) === String(module._id))
          .map(subModule => ({
            id: subModule._id,
            title: subModule.title,
            type: subModule.type,
            icon: subModule.icon || 'icon-navigation',
            order: subModule.order || 1,
            isAdd: false,
            isEdit: false,
            isDelete: false,
            isRead: false,
            children: subChildModules
              .filter(subChild => String(subChild.subModuleId) === String(subModule._id))
              .map(subChild => ({
                id: subChild._id,
                title: subChild.title,
                type: subChild.type,
                isAdd: false,
                isEdit: false,
                isDelete: false,
                isRead: false
              }))
          }))
      }));


      return { success: true, data: { menus: formattedModules } };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
















}
