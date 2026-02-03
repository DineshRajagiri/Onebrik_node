import { Body, Controller, Delete, Get, Inject, Param, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { IUserService } from './users';
import { Services } from 'src/utils/constants';
import { Public } from 'src/decorators/public.decorator';
import { BaseResponse } from 'src/common/DTO/base-response.dto';
import { UpdateUserDto } from "./dto/update-user.dto";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { CreateVendorDto } from "./dto/create-vendor.dto";
import { CreateDeliveryPartnerDto } from "./dto/delivery-partner.dto";
import { SafeSwaggerClassDecorator, SafeSwaggerDecorator } from 'src/common/decorators/safe-swagger.decorator';

// Safe wrapper for documentation - errors won't affect the API
const SafeUsersTags = SafeSwaggerClassDecorator(() => {
  const { UsersTags } = require('../doc/users/users.swagger');
  return UsersTags;
});

const SafeUsersDecorators = {
  createAdmin: SafeSwaggerDecorator(() => {
    const { UsersDecorators } = require('../doc/users/users.swagger');
    return UsersDecorators.createAdmin;
  }),
  createVendor: SafeSwaggerDecorator(() => {
    const { UsersDecorators } = require('../doc/users/users.swagger');
    return UsersDecorators.createVendor;
  }),
  createDeliveryPartner: SafeSwaggerDecorator(() => {
    const { UsersDecorators } = require('../doc/users/users.swagger');
    return UsersDecorators.createDeliveryPartner;
  }),
  findAll: SafeSwaggerDecorator(() => {
    const { UsersDecorators } = require('../doc/users/users.swagger');
    return UsersDecorators.findAll;
  }),
  findOne: SafeSwaggerDecorator(() => {
    const { UsersDecorators } = require('../doc/users/users.swagger');
    return UsersDecorators.findOne;
  }),
  remove: SafeSwaggerDecorator(() => {
    const { UsersDecorators } = require('../doc/users/users.swagger');
    return UsersDecorators.remove;
  })
};

@SafeUsersTags
@Controller('user')
export class UsersController {
  constructor(
    @Inject(Services.USERS) private service: IUserService,
  ) { }

@Public()
  @Post('admin')
  @SafeUsersDecorators.createAdmin
  async createAdmin(@Body() dto: CreateAdminDto) {
    const data = await this.service.createAdmin(dto);
    return BaseResponse.ok(data, 'Admin created successfully');
  }

  // ===== VENDOR =====
  @Public()
  @Post('vendor')
  @SafeUsersDecorators.createVendor
  async createVendor(@Body() dto: CreateVendorDto) {
    const data = await this.service.createVendor(dto);
    return BaseResponse.ok(data, 'Vendor created successfully');
  }

  // ===== DELIVERY BOY =====
  @Public()
  @Post('deliveryPartner')
  @SafeUsersDecorators.createDeliveryPartner
  async createDeliveryPartner(@Body() dto: CreateDeliveryPartnerDto) {
    const data = await this.service.createDeliveryPartner(dto);
    return BaseResponse.ok(data, 'Delivery partner created successfully');
  }

  // ===== COMMON =====
  @Get()
  @SafeUsersDecorators.findAll
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @SafeUsersDecorators.findOne
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Delete(':id')
  @SafeUsersDecorators.remove
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return BaseResponse.ok(null, 'User deleted');
  }
}