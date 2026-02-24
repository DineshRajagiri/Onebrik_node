
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
}
