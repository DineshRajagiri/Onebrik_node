import { ForbiddenException, HttpException, HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/schema/user.schema';
import mongoose, { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Roles, Services, userResponseMessage } from 'src/utils/constants';
import * as jwt from 'jsonwebtoken';
import { IAuthService } from './auth';
import { INotificationService } from 'src/notification/notification';
import { CreateAdminDTO } from './DTO/createAdmin.dto';
import { admin, adminDetails } from 'src/schema/admin.schema';
import axios from 'axios';
import { AdminLoginDTO } from './DTO/adminLogin.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AadharDTO } from './DTO/aadhar.dto';
import { PanDTO } from './DTO/pan.dto';
import { STATUS_CODES } from 'src/utils/status-codes';
import { RESPONSE_MESSAGES } from 'src/utils/response-messages';
import { LoginDto } from './DTO/login.dto';
import { roles, rolesDetails } from 'src/schema/role.schema';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(roles.name) private readonly roleModel: Model<rolesDetails>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

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
          name: user.name,
          email: user.email,
          role: role.name,
        }
      }
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
        { refreshToken: tokens.refreshToken }
      );

      return {
        success: true,
        data: tokens,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}

