// import { CreateUserDto } from "../dto/create-user.dto";
// import { UpdateUserDto } from "../dto/update-user.dto";

import { CreateUserDto } from "./dto/create-user.dto";
// import { UpdateUserDto } from "./DTO/update-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { CreateVendorDto } from "./dto/create-vendor.dto";
import { CreateDeliveryPartnerDto } from "./dto/delivery-partner.dto";

export interface IUserService {
  create(dto: CreateUserDto): Promise<any>;
  createAdmin(dto: any): Promise<any>;
  createVendor(dto: any): Promise<any>;
  createDeliveryPartner(dto: any): Promise<any>;
  findAll(page?: number, limit?: number, search?: string): Promise<any>;
  findOne(id: string): Promise<any>;
  update(id: string, dto: Partial<CreateUserDto>): Promise<any>;
  remove(id: string): Promise<any>;
}