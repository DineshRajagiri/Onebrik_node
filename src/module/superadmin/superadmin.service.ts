
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schema/user.schema';
import { UserDTO } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { In } from 'typeorm';
import { MailService } from 'src/mail/mail.service';
import { stat } from 'fs';
import { messaging } from 'firebase-admin';
@Injectable()

export class SuperAdminService {
  constructor(
   @InjectModel(User.name) private readonly userModel: Model<UserDocument>, 
  private readonly mailService: MailService
  ) { }


  async create(dto: UserDTO) {
    try {
      const hashedPassword = await bcrypt.hash(dto.passwordHash, 10);
      this.mailService.sendMail(dto.email, dto.name, dto.passwordHash);
      const user = new this.userModel({ ...dto, passwordHash: hashedPassword });
      return user.save();
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
    return {data :data ,status : true ,message : "users fetched successfully"};
  }
}
