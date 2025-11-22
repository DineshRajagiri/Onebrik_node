import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { modules, modulesDetails } from 'src/schema/module.schema';
import { subModules, subModulesDetails } from 'src/schema/subModule.schema';
import { subModuleChild, subModuleChildDetails } from 'src/schema/subModuleChild.schema';
import { CreateRoleDTO } from './DTO/role.dto';
import { roles, rolesDetails } from 'src/schema/role.schema';
import { AssignPermissionDTO } from './DTO/assign-permission.dto';


@Injectable()
export class RoleService {
    constructor(
        @InjectModel(roles.name) private readonly roles: Model<rolesDetails>,
        @InjectModel(modules.name) private readonly modules: Model<modulesDetails>,
        @InjectModel(subModules.name) private readonly subModules: Model<subModulesDetails>,
        @InjectModel(subModuleChild.name) private readonly subModuleChild: Model<subModuleChildDetails>
    ) { }

    async createRole(data: CreateRoleDTO) {
        const exist = await this.roles.findOne({ name: data.name });
        if (exist) {
            return {
                success: false,
                statusCode: HttpStatus.CONFLICT,
                message: 'Role already exists',
            };
        }

        const created = await this.roles.create({ name: data.name });

        return {
            success: true,
            statusCode: HttpStatus.CREATED,
            message: 'Role created successfully',
            role: created,
        };
    }

    async generatePermissionKey(moduleId: string, subModuleId: string, childId: string) {
        const module = await this.modules.findById(moduleId);
        const submodule = await this.subModules.findById(subModuleId);
        const child = await this.subModuleChild.findById(childId);

        if (!module || !submodule || !child) {
            throw new HttpException('Invalid module/submodule/child', HttpStatus.BAD_REQUEST);
        }

        return `${module.key}.${submodule.key}.${child.key}`;
    }

    async assignPermissions(dto: AssignPermissionDTO) {
        const role = await this.roles.findById(dto.roleId);
        if (!role) {
            throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
        }

        const permissionKeys = [];

        for (const p of dto.permissions) {
            const key = await this.generatePermissionKey(p.moduleId, p.subModuleId, p.childId);
            permissionKeys.push(key);
        }

        role.permissions = permissionKeys;
        await role.save();

        return {
            success: true,
            statusCode: 200,
            message: 'Permissions assigned successfully',
            permissions: permissionKeys,
        };
    }
}
