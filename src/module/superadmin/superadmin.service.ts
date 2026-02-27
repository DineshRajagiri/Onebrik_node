
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schema/user.schema';
import { UserDTO } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { In } from 'typeorm';
import { MailService } from 'src/mail/mail.service';
import { stat } from 'fs';
import { messaging } from 'firebase-admin';
import { roles, rolesDetails } from 'src/schema/role.schema';
import { isUUID } from 'class-validator';
@Injectable()

export class SuperAdminService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(roles.name) private roleModel: Model<rolesDetails>,
    private readonly mailService: MailService
  ) { }


  // async create(dto: UserDTO) {
  //   try {
  //     const hashedPassword = await bcrypt.hash(dto.passwordHash, 10);
  //     this.mailService.sendMail(dto.email, dto.name, dto.passwordHash);
  //     const user = new this.userModel({ ...dto, passwordHash: hashedPassword });
  //     return user.save();
  //   } catch (error) {
  //     throw error;
  //   }
  // }
  async create(dto: UserDTO) {
    try {

      if (!isUUID(dto.roleId)) {
        throw new BadRequestException('Invalid roleId format');
      }
      const role = await this.roleModel.findById(dto.roleId).lean();
      if (!role) {
        throw new NotFoundException('Role not found');
      }
      const existingUser = await this.userModel.findOne({ email: dto.email }).lean();
      if (existingUser) {
        throw new ConflictException('Email already registered');
      }
      const hashedPassword = await bcrypt.hash(dto.passwordHash, 10);
      await this.mailService.sendMail(dto.email, dto.name, dto.passwordHash);
      const user = new this.userModel({
        ...dto,
        passwordHash: hashedPassword
      });

      return {
        success: true,
        message: "User created successfully",
        data: await user.save()
      };

    } catch (error) {
      throw error;
    }
  }

  async upsert(dto: UserDTO) {
    try {

      if (!isUUID(dto.roleId)) {
        throw new BadRequestException('Invalid roleId format');
      }

      const role = await this.roleModel.findById(dto.roleId).lean();
      if (!role) {
        throw new NotFoundException('Role not found');
      }

      if (dto.id) {

        const existingUser = await this.userModel.findById(dto.id);
        if (!existingUser) {
          throw new NotFoundException('User not found');
        }

        const emailExists = await this.userModel.findOne({
          email: dto.email,
          _id: { $ne: dto.id }
        });

        if (emailExists) {
          throw new ConflictException('Email already registered');
        }

        if (dto.passwordHash) {
          dto.passwordHash = await bcrypt.hash(dto.passwordHash, 10);
        } else {
          delete dto.passwordHash;
        }

        const updatedUser = await this.userModel.findByIdAndUpdate(
          dto.id,
          dto,
          { new: true }
        );

        return {
          success: true,
          message: "User updated successfully",
          data: updatedUser
        };
      }

      const existingUser = await this.userModel.findOne({ email: dto.email });
      if (existingUser) {
        throw new ConflictException('Email already registered');
      }

      const hashedPassword = await bcrypt.hash(dto.passwordHash, 10);

      await this.mailService.sendMail(dto.email, dto.name, dto.passwordHash);

      const user = new this.userModel({
        ...dto,
        passwordHash: hashedPassword
      });

      return {
        success: true,
        message: "User created successfully",
        data: await user.save()
      };

    } catch (error) {
      throw error;
    }
  }

  async getAllUsers(
    page: number,
    limit: number,
    search?: string
  ) {
    try {

      const skip = (page - 1) * limit;


      const filter: any = { isDeleted: false };

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { mobilenumber: { $regex: search, $options: 'i' } }
        ];
      }

      const [users, total] = await Promise.all([
        this.userModel
          .find(filter)
          .populate('roleId', 'name key')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),

        this.userModel.countDocuments(filter)
      ]);

      return {
        success: true,
        message: "Users fetched successfully",
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        data: users
      };

    } catch (error) {
      throw error;
    }
  }

  async UserDropdown(roleId: string, search?: string) {
    try {

      if (!isUUID(roleId)) {
        throw new BadRequestException('Invalid roleId format');
      }

      const filter: any = {
        roleId,
        isDeleted: false,
        isActive: true
      };

      if (search) {
        filter.name = { $regex: search, $options: 'i' };
      }

      const users = await this.userModel
        .find(filter)
        .select('_id name')
        .sort({ name: 1 })
        .lean();

      return {
        success: true,
        message: 'User list fetched successfully',
        data: users
      };

    } catch (error) {
      throw error;
    }
  }

  async getUserById(id: string) {
    try {

      if (!isUUID(id)) {
        throw new BadRequestException('Invalid userId format');
      }

      const user = await this.userModel
        .findOne({ _id: id, isDeleted: false })
        .populate('roleId', 'name key')
        .lean();

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        success: true,
        message: 'User fetched successfully',
        data: user
      };

    } catch (error) {
      throw error;
    }
  }

  async getroles() {
    return ['admin', 'editor', 'viewer'];
  }

  async getusers() {
    const data = await this.userModel.aggregate([
      {
        $lookup: {
          from: 'roles',
          localField: 'roleId',
          foreignField: '_id',
          as: 'role'
        }
      },
      {
        $unwind: {
          path: '$role',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          roleId: '$role.name'
        }
      },
      {
        $project: {
          role: 0
        }
      }
    ]);
    return { data: data, status: true, message: "users fetched successfully" };
  }

  async deleteUser(id: string) {
    try {

      if (!isUUID(id)) {
        throw new BadRequestException('Invalid userId format');
      }

      const user = await this.userModel.findById(id);

      if (!user || user.isDeleted) {
        throw new NotFoundException('User not found');
      }

      user.isDeleted = true;
      await user.save();

      return {
        success: true,
        message: 'User deleted successfully'
      };

    } catch (error) {
      throw error;
    }
  }
}
