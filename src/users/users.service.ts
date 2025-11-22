import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from 'src/schema/user.schema';
import { Logger } from '@nestjs/common';
import { SaveUserDto } from './DTO/create-user.dto';
import { AssignRoleDto } from './DTO/assign-role.dto';
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);


  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) { }


  async save(dto: SaveUserDto) {
    // UPDATE MODE
    if (dto.userId) {
      const user = await this.userModel.findById(dto.userId);

      if (!user) {
        throw new HttpException("User not found", HttpStatus.NOT_FOUND);
      }

      if (dto.password) {
        dto.password = await bcrypt.hash(dto.password, 10);
      }

      Object.assign(user, dto);
      await user.save();

      return {
        success: true,
        statusCode: 200,
        message: "User updated successfully",
        user
      };
    }

    // CREATE MODE
    const exists = await this.userModel.findOne({ email: dto.email });

    if (exists) {
      throw new HttpException("Email already exists", HttpStatus.CONFLICT);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const created = await this.userModel.create({
      fullName: dto.fullName,
      email: dto.email,
      password: hashedPassword,
      roleId: dto.roleId || null
    });

    return {
      success: true,
      statusCode: 201,
      message: "User created successfully",
      user: created
    };
  }
}
