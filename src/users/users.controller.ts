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

@Controller('user')
export class UsersController {
  constructor(
    @Inject(Services.USERS) private service: IUserService,
  ) { }

  @Public()
  @Post('admin')
  async createAdmin(@Body() dto: CreateAdminDto) {
    const data = await this.service.createAdmin(dto);
    return BaseResponse.ok(data, 'Admin created successfully');
  }

  @Public()
  @Post('vendor')
  async createVendor(@Body() dto: CreateVendorDto) {
    const data = await this.service.createVendor(dto);
    return BaseResponse.ok(data, 'Vendor created successfully');
  }

  @Public()
  @Post('deliveryPartner')
  async createDeliveryPartner(@Body() dto: CreateDeliveryPartnerDto) {
    const data = await this.service.createDeliveryPartner(dto);
    return BaseResponse.ok(data, 'Delivery partner created successfully');
  }

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return BaseResponse.ok(null, 'User deleted');
  }
}