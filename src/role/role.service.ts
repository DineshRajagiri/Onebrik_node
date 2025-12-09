import { Injectable, HttpException, HttpStatus, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { roles, rolesDetails } from 'src/schema/role.schema';
import { Model } from 'mongoose';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Permission, permissionDetails } from 'src/schema/permission.schema';


@Injectable()
export class RoleService {

    constructor(
        @InjectModel(roles.name) private roleModel: Model<rolesDetails>,
        @InjectModel(Permission.name) private permissionModel: Model<permissionDetails>
    ) { }

  async create(dto: CreateRoleDto): Promise<roles> {
    const exists = await this.roleModel.findOne({ name: dto.name.trim() });
    if (exists) {
      throw new ConflictException('Role with this name already exists');
    }
    return this.roleModel.create(dto);
  }

  async findAll(): Promise<roles[]> {
    return this.roleModel.find().sort({ createdAt: -1 }).lean();
  }

  async findOne(id: string): Promise<roles> {
    const role = await this.roleModel.findById(id).lean();
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async update(id: string, dto: UpdateRoleDto): Promise<roles> {
    const updated = await this.roleModel
      .findByIdAndUpdate(id, dto, { new: true })
      .lean();
    if (!updated) throw new NotFoundException('Role not found');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const res = await this.roleModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Role not found');
  }
}
