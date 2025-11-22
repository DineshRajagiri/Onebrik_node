import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/schema/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SuperAdminSeeder implements OnApplicationBootstrap {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  async onApplicationBootstrap() {
    const admin = await this.userModel.findOne({ email: "admin@onebrik.com" });

    if (!admin) {
      const hashed = await bcrypt.hash("Admin@123", 10);

      await this.userModel.create({
        fullName: "Super Admin",
        email: "admin@onebrik.com",
        password: hashed,
        roleId: 'SuperAdmin'
      });

      console.log("🌟 SuperAdmin created: admin@onebrik.com / Admin@123");
    } else {
      console.log("SuperAdmin already exists.");
    }
  }
}
