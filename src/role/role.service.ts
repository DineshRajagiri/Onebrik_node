import { Injectable, HttpException, HttpStatus, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { roles, rolesDetails } from 'src/schema/role.schema';
import { Model } from 'mongoose';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Permission, permissionDetails } from 'src/schema/permission.schema';
import { UpsertRoleDto } from './DTO/upsert-role.dto';


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

  async upsertRole(dto: UpsertRoleDto) {
  try {
    if (!dto.name || !dto.name.trim()) {
      throw new BadRequestException('Role name is required');
    }

    const name = dto.name.trim();
    if (dto.id) {
      const role = await this.roleModel.findById(dto.id);

      if (!role) {
        throw new NotFoundException('Role not found');
      }

      if (role.name !== name) {
        const exists = await this.roleModel.findOne({ name }).lean();
        if (exists) {
          throw new ConflictException(`Role '${name}' already exists`);
        }
      }

      role.name = name;
      role.description = dto.description ?? role.description;
      role.isActive = dto.isActive ?? role.isActive;
      role.updatedAt = new Date();

      await role.save();

      return {
        success: true,
        message: 'Role updated successfully',
        data: role
      };
    }
    const exists = await this.roleModel.findOne({ name }).lean();
    if (exists) {
      throw new ConflictException(`Role '${name}' already exists`);
    }

    const created = await this.roleModel.create({
      name,
      description: dto.description || '',
      isActive: dto.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      success: true,
      message: 'Role created successfully',
      data: created
    };

  } catch (err) {
    console.error('Error in upsertRole:', err);

    if (
      err instanceof BadRequestException ||
      err instanceof ConflictException ||
      err instanceof NotFoundException
    ) {
      throw err;
    }

    throw new HttpException(
      'Unexpected error occurred while creating/updating the role',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}


async getPaginatedRoles(page: number, limit: number): Promise<any> {
  try {
    page = Number(page) || 1;
    limit = Number(limit) || 10;

    const skip = (page - 1) * limit;

    const filter = { isDeleted: { $ne: true } };

    const [data, total] = await Promise.all([
      this.roleModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      this.roleModel.countDocuments(filter)
    ]);

    return {
      success: true,
      message: "Roles fetched successfully",
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data
    };

  } catch (error) {
    console.error("Role Fetch Error →", error);

    return {
      success: false,
      message: "Failed to fetch role data",
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0
      },
      data: []
    };
  }
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
