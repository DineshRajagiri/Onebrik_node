import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId, Types } from 'mongoose';
// import { Menu, MenuDocument } from 'src/schema/menu.schema';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { Menu, MenuDocument } from 'src/schema/menu.schema';
import { modules, modulesDetails } from 'src/schema/module.schema';
import { subModules, subModulesDetails } from 'src/schema/subModule.schema';
import { subModuleChild, subModuleChildDetails } from 'src/schema/subModuleChild.schema';
import { User, UserDocument } from 'src/schema/user.schema';
import { Permission, permissionDetails } from 'src/schema/permission.schema';

@Injectable()
export class RbacService {

  constructor(
    @InjectModel(modules.name) private readonly modules: Model<modulesDetails>,
    @InjectModel(subModules.name) private readonly subModules: Model<subModulesDetails>,
    @InjectModel(subModuleChild.name) private readonly subModuleChild: Model<subModuleChildDetails>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Permission.name) private permissionModel: Model<permissionDetails>,
    //  @InjectModel(Menu.name) private readonly menuModel: Model<MenuDocument>
  ) { }

  async getMenuForUser(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const roleId = user.roleId.toString();

    const permissions = await this.permissionModel
      .find({ roleId, canView: true })
      .lean();

    if (!permissions.length) return [];

    const moduleIds = [...new Set(permissions.map((p) => p.moduleId.toString()))];
    const subModuleIds = [...new Set(permissions.filter(p => p.subModuleId).map((p) => p.subModuleId.toString()))];
    const childIds = [...new Set(permissions.filter(p => p.subModuleChildId).map((p) => p.subModuleChildId.toString()))];

    const [modules, subModules, children] = await Promise.all([
      this.modules.find({ _id: { $in: moduleIds }, isActive: true }).lean(),
      this.subModules.find({ _id: { $in: subModuleIds }, isActive: true }).lean(),
      this.subModuleChild.find({ _id: { $in: childIds }, isActive: true }).lean(),
    ]);

    const menu: any[] = [];

    for (const m of modules.sort((a, b) => a.sortOrder - b.sortOrder)) {
      const moduleNode: any = {
        id: m.key,
        title: m.title,
        type: 'group',
        icon: m.icon,
        url: m.url,
        children: [],
      };

      const modulePermissions = permissions.filter(
        (p) => p.moduleId.toString() === m._id.toString(),
      );

      const subIdsForModule = [
        ...new Set(
          modulePermissions
            .filter((p) => p.subModuleId)
            .map((p) => p.subModuleId.toString()),
        ),
      ];

      const subsForModule = subModules.filter((s) =>
        subIdsForModule.includes(s._id.toString()),
      );

      for (const s of subsForModule.sort((a, b) => a.sortOrder - b.sortOrder)) {
        const subNode: any = {
          id: s.key,
          title: s.title,
          type: 'collapse',
          icon: s.icon,
          url: s.url,
          children: [],
        };

        const childIdsForSub = [
          ...new Set(
            modulePermissions
              .filter(
                (p) =>
                  p.subModuleId &&
                  p.subModuleId.toString() === s._id.toString() &&
                  p.subModuleChildId,
              )
              .map((p) => p.subModuleChildId.toString()),
          ),
        ];

        const childrenForSub = children.filter((c) =>
          childIdsForSub.includes(c._id.toString()),
        );

        for (const c of childrenForSub.sort(
          (a, b) => a.sortOrder - b.sortOrder,
        )) {
          subNode.children.push({
            id: c.key,
            title: c.title,
            type: 'item',
            url: c.url,
          });
        }

        moduleNode.children.push(subNode);
      }

      menu.push(moduleNode);
    }

    return menu;
  }


}
