
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schema/user.schema';
import { UserDTO } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
@Injectable()

export class SuperAdminService {
  constructor(
   @InjectModel(User.name) private readonly userModel: Model<UserDocument>, 
  ) { }


  async create(dto: UserDTO) {
    const hashedPassword = await bcrypt.hash(dto.passwordHash, 10);
    const user = new this.userModel({ ...dto, passwordHash: hashedPassword });
    return user.save();
  }
  
  async getroles() {
    return ['admin', 'editor', 'viewer'];
  }
}
