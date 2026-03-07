import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerDetails } from 'src/schema/customer.schema';
import { Otp, OtpDocument } from 'src/schema/otp.schema';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';
import { UpdateCustomerProfileDto } from './DTO/update-customer-profile.dto';

@Injectable()
export class CustomerAuthService {

  constructor(
    @InjectModel(Customer.name)
    private customerModel: Model<CustomerDetails>,

    @InjectModel(Otp.name)
    private otpModel: Model<OtpDocument>,

    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) { }

  private readonly logger = new Logger(CustomerAuthService.name);

  // =========================
  // SEND OTP
  // =========================

  async sendOtp(email: string) {

    const normalizedEmail = email.toLowerCase().trim();

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.otpModel.deleteMany({
      email: normalizedEmail,
      purpose: 'login',
    });

    await this.otpModel.create({
      email: normalizedEmail,
      otp,
      purpose: 'login',   // internal only
      expiresAt,
    });

    await this.mailService.sendOtpEmail(normalizedEmail, otp, 'login');

    return {
      success: true,
      message: 'OTP sent to email',
      data: {
        email: normalizedEmail,
      },
    };
  }

  // =========================
  // VERIFY OTP (LOGIN / SIGNUP)
  // =========================

  async verifyOtp(email: string, otp: string) {

    const normalizedEmail = email.toLowerCase().trim();

    const otpRecord = await this.otpModel.findOne({
      email: normalizedEmail,
      otp,
      purpose: 'login',   // internal
    });

    if (!otpRecord) {
      throw new UnauthorizedException('Invalid OTP');
    }

    if (new Date() > otpRecord.expiresAt) {
      throw new UnauthorizedException('OTP expired');
    }

    let customer = await this.customerModel.findOne({
      email: normalizedEmail,
    });

    if (!customer) {
      customer = await this.customerModel.create({
        email: normalizedEmail,
        isEmailVerified: true,
      });
    }

    const tokens = await this.generateTokens(customer);

    await this.otpModel.deleteOne({ _id: otpRecord._id });

    return {
      success: true,
      message: 'Login successful',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        customer: {
          id: customer._id,
          customerId: customer.customerId,
          email: customer.email,
          name: customer.name,
        },
      },
    };
  }

  // =========================
  // TOKEN GENERATION
  // =========================

  async generateTokens(customer: CustomerDetails) {

    const payload = {
      sub: customer._id.toString(),
      email: customer.email,
      role: 'customer',
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: '1d',
    });

    const refreshToken = this.jwtService.sign(
      { sub: customer._id.toString() },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      },
    );

    return { accessToken, refreshToken };
  }

  // =========================
  // GET PROFILE
  // =========================
  async getProfile(customerId: string) {

    const customer = await this.customerModel.findById(customerId);

    if (!customer) {
      throw new UnauthorizedException('Customer not found');
    }

    return {
      success: true,
      data: {
        id: customer._id,
        customerId: customer.customerId,
        email: customer.email,
        name: customer.name,
        profilePicture: customer.profilePicture
      },
    };
  }
  // =========================
  // UPDATE PROFILE
  // =========================

  async upsertProfile(
    customerId: string,
    dto: UpdateCustomerProfileDto,
    imageUrl?: string
  ) {

    const updateData: any = {};

    if (dto.name) {
      updateData.name = dto.name;
    }

    if (dto.mobileNumber) {
      updateData.mobileNumber = dto.mobileNumber;
    }

    if (imageUrl) {
      updateData.profilePicture = imageUrl;
    }

    const customer = await this.customerModel.findByIdAndUpdate(
      customerId,
      { $set: updateData },
      { new: true, upsert: true },
    );

    return {
      success: true,
      message: "Profile updated successfully",
      data: {
        id: customer._id,
        customerId: customer.customerId,
        email: customer.email,
        name: customer.name,
        mobileNumber: customer.mobileNumber,
        profilePicture: customer.profilePicture,
      },
    };
  }
}