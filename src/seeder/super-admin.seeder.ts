import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { admin, adminDetails } from 'src/schema/admin.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Roles } from 'src/utils/constants';
import { randomUUID } from 'crypto';

@Injectable()
export class SuperAdminSeeder implements OnApplicationBootstrap {
  constructor(
    @InjectModel(admin.name) private adminModel: Model<adminDetails>,
  ) {}

  async onApplicationBootstrap() {
    const email = 'admin@onebrik.com';

    const existing = await this.adminModel.findOne({ email });

    if (!existing) {
      const hashed = await bcrypt.hash('Admin@123', 10);

      await this.adminModel.create({
        userId: randomUUID(),
        email,
        fullName: 'Super Admin',
        passwordHash: hashed,
        role: Roles.SUPERADMIN,
        isActive: true,
        isDeleted: false,
        isVerifiedByAdmin: true,
      });

      console.log('🌟 SuperAdmin created: admin@onebrik.com / Admin@123');
    } else {
      console.log('✅ SuperAdmin already exists.');
    }
  }
}
