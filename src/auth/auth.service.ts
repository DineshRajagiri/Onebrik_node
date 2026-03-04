import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/schema/user.schema';
import { Otp, OtpDocument } from 'src/schema/otp.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './DTO/login.dto';
import { roles, rolesDetails } from 'src/schema/role.schema';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';
import { OtpPurpose } from './DTO/customer-send-otp.dto';
import { CustomerSignupDto } from './DTO/customer-signup.dto';
import { UpdateCustomerProfileDto } from './DTO/update-customer-profile.dto';
import { ChangePasswordDto } from './DTO/change-password.dto';
import { GHIBLI_AVATARS, getGhibliAvatarUrlById } from './constants/ghibli-avatars';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Otp.name) private readonly otpModel: Model<OtpDocument>,
    @InjectModel(roles.name) private readonly roleModel: Model<rolesDetails>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  // ==============================
  // LOGIN (EMAIL + PASSWORD)
  // ==============================
  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase();

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new ForbiddenException('User is inactive');
    }

    const role = await this.roleModel.findById(user.roleId);
    if (!role) {
      throw new UnauthorizedException('Role not found');
    }

    const tokens = await this.generateTokens(user, role.name);

    await this.userModel.updateOne(
      { _id: user._id },
      { refreshToken: tokens.refreshToken }
    );

    return {
      success: true,
      message: 'Login successful',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user._id,
          userid: user.userid,
          name: user.name,
          email: user.email,
          role: role.name,
          avatarUrl: user.avatarUrl,
        }
      }
    };
  }

  // ==============================
  // CUSTOMER - LOGIN (EMAIL + PASSWORD)
  // ==============================
  async customerPasswordLogin(email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await this.userModel.findOne({ email: normalizedEmail });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Account is inactive');
    }

    const role = await this.roleModel.findById(user.roleId);
    if (!role) {
      throw new UnauthorizedException('Role not found');
    }
    if (!/customer/i.test(role.name)) {
      throw new ForbiddenException('This endpoint is for customers only. Use /auth/login for other roles.');
    }

    const tokens = await this.generateTokens(user, role.name);
    await this.userModel.updateOne(
      { _id: user._id },
      { refreshToken: tokens.refreshToken },
    );

    return {
      success: true,
      message: 'Login successful',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user._id,
          userid: user.userid,
          name: user.name,
          email: user.email,
          role: role.name,
          avatarUrl: user.avatarUrl,
        },
      },
    };
  }

  // ==============================
  // TOKEN GENERATION
  // ==============================
  private async generateTokens(user: UserDocument, roleName: string) {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: roleName,   // ADMIN / VENDOR / DELIVERY
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: '1d',
    });

    const refreshToken = this.jwtService.sign(
      { sub: user._id.toString() },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      },
    );

    return { accessToken, refreshToken };
  }


  // ==============================
  // REFRESH TOKEN
  // ==============================
  async refreshToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.userModel.findOne({
        _id: decoded.sub,
        refreshToken,
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const role = await this.roleModel.findById(user.roleId);

      const tokens = await this.generateTokens(user, role.name);

      await this.userModel.updateOne(
        { _id: user._id },
        { refreshToken: tokens.refreshToken },
      );

      return {
        success: true,
        data: tokens,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async signUpUser(_dto: any) {
    throw new BadRequestException('Use POST /auth/customer/send-otp and /auth/customer/signup instead');
  }
  async checkAdmin(_dto: any) {
    throw new BadRequestException('Admin registration not implemented');
  }
  async adminLogin(_dto: any) {
    throw new BadRequestException('Admin login not implemented');
  }
  async verifyOtp(_p: string, _l: string, _o: string) {
    throw new BadRequestException('Use customer OTP endpoints');
  }
  async verifyOtpAndSaveUser(_o: string, _d: any) {
    throw new BadRequestException('Use POST /auth/customer/signup');
  }
  async verifyOtpAndLogin(p: string, o: string, _l: string) {
    if (p?.includes('@')) return this.customerVerifyOtpLogin(p, o);
    throw new BadRequestException('Use customer OTP endpoints');
  }
  validateUser(_d: any) {}
  createAccessToken(_d: any) {}
  async initiateLogin(_d: any) {
    throw new BadRequestException('Use customer OTP flow');
  }

  // ==============================
  // CUSTOMER - SEND OTP
  // ==============================
  async sendOtpForCustomer(email: string, purpose: OtpPurpose) {
    const normalizedEmail = email.toLowerCase().trim();
    this.logger.log(
      `Received sendOtpForCustomer request. email=${normalizedEmail}, purpose=${purpose}`,
    );

    if (purpose === OtpPurpose.SIGNUP) {
      const existing = await this.userModel.findOne({ email: normalizedEmail });
      if (existing) {
        throw new ConflictException('Email already registered. Please login.');
      }
    } else if (purpose === OtpPurpose.LOGIN) {
      const existing = await this.userModel.findOne({ email: normalizedEmail });
      if (!existing) {
        throw new BadRequestException('No account found with this email.');
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.logger.log(
      `Generated OTP for customer. email=${normalizedEmail}, purpose=${purpose}, otp=${otp}`,
    );
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await this.otpModel.deleteMany({ email: normalizedEmail, purpose });
    await this.otpModel.create({
      email: normalizedEmail,
      otp,
      purpose,
      expiresAt,
    });

    this.logger.log(
      `Persisted OTP in database. email=${normalizedEmail}, purpose=${purpose}, expiresAt=${expiresAt.toISOString()}`,
    );

    await this.mailService.sendOtpEmail(normalizedEmail, otp, purpose);
    this.logger.log(
      `Completed sendOtpForCustomer successfully. email=${normalizedEmail}, purpose=${purpose}`,
    );

    return {
      success: true,
      message: 'OTP sent to your email',
      data: { email: normalizedEmail },
    };
  }

  // ==============================
  // CUSTOMER - VERIFY OTP (separate step: signup → signupToken, login → tokens)
  // ==============================
  private signupTokenSecret(): string {
    return this.configService.get('JWT_ACCESS_SECRET') || 'signup-secret';
  }

  private generateSignupToken(email: string): string {
    return this.jwtService.sign(
      { email: email.toLowerCase().trim(), purpose: 'signup' },
      { secret: this.signupTokenSecret(), expiresIn: '15m' },
    );
  }

  async verifyOtpForCustomer(email: string, otp: string, purpose: OtpPurpose) {
    const normalizedEmail = email.toLowerCase().trim();

    const otpRecord = await this.otpModel.findOne({
      email: normalizedEmail,
      otp,
      purpose,
    });

    if (!otpRecord) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }
    if (new Date() > otpRecord.expiresAt) {
      await this.otpModel.deleteOne({ _id: otpRecord._id });
      throw new UnauthorizedException('OTP has expired');
    }

    if (purpose === OtpPurpose.SIGNUP) {
      await this.otpModel.deleteOne({ _id: otpRecord._id });
      const existing = await this.userModel.findOne({ email: normalizedEmail });
      if (existing) {
        throw new ConflictException('Email already registered');
      }
      const signupToken = this.generateSignupToken(normalizedEmail);
      return {
        success: true,
        message: 'OTP verified. Complete signup with name and password.',
        data: { signupToken, email: normalizedEmail },
      };
    }

    // LOGIN: verify user and return tokens
    const user = await this.userModel.findOne({ email: normalizedEmail });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (!user.isActive) {
      throw new ForbiddenException('Account is inactive');
    }
    const role = await this.roleModel.findById(user.roleId);
    const tokens = await this.generateTokens(user, role.name);
    await this.userModel.updateOne(
      { _id: user._id },
      { refreshToken: tokens.refreshToken },
    );
    await this.otpModel.deleteOne({ _id: otpRecord._id });

    return {
      success: true,
      message: 'Login successful',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user._id,
          userid: user.userid,
          name: user.name,
          email: user.email,
          role: role.name,
        },
      },
    };
  }

  // ==============================
  // CUSTOMER - COMPLETE SIGNUP (data filling after OTP verified; unique userid)
  // ==============================
  async customerSignup(dto: CustomerSignupDto) {
    let payload: { email: string; purpose: string };
    try {
      payload = this.jwtService.verify(dto.signupToken, {
        secret: this.signupTokenSecret(),
      }) as { email: string; purpose: string };
    } catch {
      throw new UnauthorizedException(
        'Invalid or expired signup token. Please request a new OTP and verify again.',
      );
    }
    if (payload.purpose !== 'signup' || !payload.email) {
      throw new UnauthorizedException('Invalid signup token');
    }

    const email = payload.email.toLowerCase().trim();

    const existing = await this.userModel.findOne({ email });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const role = await this.roleModel.findOne({
      $or: [{ name: 'Customer' }, { name: 'CUSTOMER' }],
    });
    if (!role) {
      throw new BadRequestException(
        'Customer role not found. Please contact admin to create Customer role.',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const userid = `cust_${uuidv4().replace(/-/g, '').slice(0, 12)}`;
    const user = await this.userModel.create({
      name: dto.name,
      email,
      passwordHash,
      roleId: role._id,
      isActive: true,
      userid,
    });

    const tokens = await this.generateTokens(user, role.name);
    await this.userModel.updateOne(
      { _id: user._id },
      { refreshToken: tokens.refreshToken },
    );

    return {
      success: true,
      message: 'Signup successful',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user._id,
          userid: user.userid,
          name: user.name,
          email: user.email,
          role: role.name,
          avatarUrl: user.avatarUrl,
        },
      },
    };
  }

  // ==============================
  // CUSTOMER - LOGIN WITH OTP
  // ==============================
  async customerVerifyOtpLogin(email: string, otp: string) {
    const normalizedEmail = email.toLowerCase().trim();

    const otpRecord = await this.otpModel.findOne({
      email: normalizedEmail,
      otp,
      purpose: 'login',
    });

    if (!otpRecord) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }
    if (new Date() > otpRecord.expiresAt) {
      await this.otpModel.deleteOne({ _id: otpRecord._id });
      throw new UnauthorizedException('OTP has expired');
    }

    const user = await this.userModel.findOne({ email: normalizedEmail });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (!user.isActive) {
      throw new ForbiddenException('Account is inactive');
    }

    const role = await this.roleModel.findById(user.roleId);
    const tokens = await this.generateTokens(user, role.name);
    await this.userModel.updateOne(
      { _id: user._id },
      { refreshToken: tokens.refreshToken },
    );

    await this.otpModel.deleteOne({ _id: otpRecord._id });

    return {
      success: true,
      message: 'Login successful',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user._id,
          userid: user.userid,
          name: user.name,
          email: user.email,
          role: role.name,
          avatarUrl: user.avatarUrl,
        },
      },
    };
  }

  // ==============================
  // CUSTOMER - PROFILE (get / update, Ghibli avatars)
  // ==============================
  async getCustomerProfile(userId: string) {
    const user = await this.userModel.findById(userId).lean();
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const role = await this.roleModel.findById(user.roleId).lean();
    const isCustomer = role && /customer/i.test(role.name);
    if (!isCustomer) {
      throw new ForbiddenException('Not a customer account');
    }
    return {
      success: true,
      data: {
        id: user._id,
        userid: user.userid,
        name: user.name,
        email: user.email,
        role: role?.name,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async updateCustomerProfile(userId: string, dto: UpdateCustomerProfileDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const role = await this.roleModel.findById(user.roleId);
    if (!role || !/customer/i.test(role.name)) {
      throw new ForbiddenException('Not a customer account');
    }

    const updates: Partial<{ name: string; avatarUrl: string }> = {};

    if (dto.name !== undefined) {
      updates.name = dto.name.trim();
    }

    if (dto.avatarId !== undefined) {
      const url = getGhibliAvatarUrlById(dto.avatarId);
      if (!url) {
        throw new BadRequestException(
          `Invalid avatarId. Use one of: ${GHIBLI_AVATARS.map((a) => a.id).join(', ')}`,
        );
      }
      updates.avatarUrl = url;
    } else if (dto.avatarUrl !== undefined) {
      updates.avatarUrl = dto.avatarUrl;
    }

    if (Object.keys(updates).length === 0) {
      return this.getCustomerProfile(userId);
    }

    await this.userModel.updateOne({ _id: userId }, updates);
    return this.getCustomerProfile(userId);
  }

  getGhibliAvatars() {
    return {
      success: true,
      data: GHIBLI_AVATARS.map((a) => ({ id: a.id, name: a.name, url: a.url })),
    };
  }

  // ==============================
  // CUSTOMER - CHANGE PASSWORD (JWT required)
  // ==============================
  async changeCustomerPassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const role = await this.roleModel.findById(user.roleId);
    if (!role || !/customer/i.test(role.name)) {
      throw new ForbiddenException('Not a customer account');
    }

    const match = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!match) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.userModel.updateOne({ _id: userId }, { passwordHash });

    return {
      success: true,
      message: 'Password changed successfully',
    };
  }
}

