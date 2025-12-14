import { Injectable, HttpException, HttpStatus, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/schema/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './DTO/update-user.dto';
import { roles, rolesDetails } from 'src/schema/role.schema';
import { CreateDeliveryPartnerDto } from './DTO/delivery-partner.dto';
import { admin, adminDetails } from 'src/schema/admin.schema';
import { vendor, vendorDetails } from 'src/schema/vendor.schema';
import { deliveryBoy, deliveryBoyDetails } from 'src/schema/deliveryBoy.schema';
import { CreateAdminDto } from './DTO/create-admin.dto';
import { CreateVendorDto } from './DTO/create-vendor.dto';
import { isAdminStatus } from 'src/utils/constants';
@Injectable()
export class UsersService {
  // private readonly logger = new Logger(UsersService.name);


  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(roles.name) private roleModel: Model<rolesDetails>,
    //   @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    // @InjectModel(roles.name) private readonly roleModel: Model<rolesDetails>,
    @InjectModel(admin.name) private readonly adminModel: Model<adminDetails>,
    @InjectModel(vendor.name) private readonly vendorModel: Model<vendorDetails>,
    @InjectModel(deliveryBoy.name) private readonly deliveryBoyModel: Model<deliveryBoyDetails>,
  ) { }


  private async createUser(
    name: string,
    email: string,
    password: string,
    roleKey: string,
  ): Promise<UserDocument> {

    const exists = await this.userModel.findOne({ email });
    if (exists) throw new ConflictException('Email already exists');

    const role = await this.roleModel.findOne({ key: roleKey });
    if (!role) throw new NotFoundException('Role not found');

    const passwordHash = await bcrypt.hash(password, 10);

    return this.userModel.create({
      name,
      email,
      passwordHash,
      roleId: role._id,
      isActive: true,
    });
  }

async createAdmin(dto: CreateAdminDto) {

  // 1️⃣ Validate role
  const role = await this.roleModel.findById(dto.roleId);
  if (!role) {
    throw new NotFoundException('Role not found');
  }

  // 2️⃣ Ensure correct role
  if (role.name !== 'Admin') {
    throw new BadRequestException('Only Admin role is allowed here');
  }

  // 3️⃣ Check email
  const exists = await this.userModel.findOne({ email: dto.email.toLowerCase() });
  if (exists) {
    throw new ConflictException('Email already exists');
  }

  // 4️⃣ Hash password
  const passwordHash = await bcrypt.hash(dto.password, 10);

  // 5️⃣ Create user
  const user = await this.userModel.create({
    name: dto.name,
    email: dto.email.toLowerCase(),
    passwordHash,
    roleId: role._id,
    isActive: dto.isActive ?? true,
  });

  // 6️⃣ Create admin profile
  const admin = await this.adminModel.create({
    userId: user._id,
    department: dto.department,
    level: dto.level,
  });

  return { user, admin };
}




  async createVendor(dto: CreateVendorDto) {
    const user = await this.createUser(
      dto.vendorName,
      dto.emailID,
      dto.password,
      'VENDOR'
    );

    await this.vendorModel.create({
      vendorName: dto.vendorName,
      emailID: dto.emailID,
      mobileNumber: dto.mobileNumber,
      gstNumber: dto.gstNumber,
      adress1: dto.address1,
      country: dto.country,
      state: dto.state,
      city: dto.city,
      adminId: user._id,
    });

    return user;
  }

  async createDeliveryPartner(dto: CreateDeliveryPartnerDto) {
    const user = await this.createUser(
      dto.devlieryBoyName,
      dto.emailid,
      dto.password,
      'DELIVERY_BOY'
    );

    await this.deliveryBoyModel.create({
      devlieryBoyName: dto.devlieryBoyName,
      emailid: dto.emailid,
      phoneNO: dto.phoneNO,
      regionId: dto.regionId,
      address: dto.address,
    });

    return user;
  }

  async findAll() {
    return this.userModel.find().populate('roleId', 'name key').lean();
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id).populate('roleId', 'name key');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async remove(id: string) {
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) throw new NotFoundException('User not found');
  }
}
