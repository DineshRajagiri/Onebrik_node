import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { roles, rolesDetails } from 'src/schema/role.schema';
import { Model } from 'mongoose';

@Injectable()
export class CustomerRoleSeeder implements OnApplicationBootstrap {
  constructor(
    @InjectModel(roles.name) private readonly roleModel: Model<rolesDetails>,
  ) {}

  async onApplicationBootstrap() {
    const exists = await this.roleModel.findOne({
      $or: [{ name: 'Customer' }, { name: 'CUSTOMER' }],
    });

    if (!exists) {
      await this.roleModel.create({
        name: 'Customer',
        description: 'Customer/end-user role',
        isActive: true,
      });
      console.log('✅ Customer role created.');
    }
  }
}
