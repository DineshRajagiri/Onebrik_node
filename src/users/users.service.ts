import { Injectable, HttpException, HttpStatus, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/schema/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './DTO/update-user.dto';
import { roles, rolesDetails } from 'src/schema/role.schema';
@Injectable()
export class UsersService {
  // private readonly logger = new Logger(UsersService.name);


  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
     @InjectModel(roles.name) private roleModel: Model<rolesDetails>,
  ) { }


 async create(dto: CreateUserDto): Promise<User> {
    const exists = await this.userModel.findOne({ email: dto.email });
    if (exists) throw new ConflictException('Email already in use');

    const role = await this.roleModel.findById(dto.roleId);
    if (!role) throw new NotFoundException('Role not found');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const created = await this.userModel.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      roleId: dto.roleId,
      isActive: dto.isActive ?? true,
    });

    return created.toObject();
  }

  async findAll(): Promise<User[]> {
    return this.userModel
      .find()
      .populate('roleId', 'name')
      .lean();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel
      .findById(id)
      .populate('roleId', 'name')
      .lean();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');

    if (dto.email && dto.email !== user.email) {
      const exists = await this.userModel.findOne({ email: dto.email });
      if (exists) throw new ConflictException('Email already in use');
      user.email = dto.email;
    }

    if (dto.name) user.name = dto.name;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;
    if (dto.roleId) {
      const role = await this.roleModel.findById(dto.roleId);
      if (!role) throw new NotFoundException('Role not found');
      user.roleId = dto.roleId as any;
    }
    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    await user.save();
    return user.toObject();
  }

  async remove(id: string): Promise<void> {
    const res = await this.userModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('User not found');
  }
}
