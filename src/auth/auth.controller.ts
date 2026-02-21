import { Body, Controller, Get, Inject, Patch, Post, Req } from '@nestjs/common';
import { Services } from 'src/utils/constants';
import { IAuthService } from './auth';
import { CreateUserDTO } from './DTO/createUser.dto';
import { CreateAdminDTO } from './DTO/createAdmin.dto';
import { AdminLoginDTO } from './DTO/adminLogin.dto';
import { Public } from 'src/decorators/public.decorator';
import { LoginDto } from './DTO/login.dto';
import { CustomerPasswordLoginDto } from './DTO';
import { SafeSwaggerClassDecorator, SafeSwaggerDecorator } from 'src/common/decorators/safe-swagger.decorator';

// Safe wrapper for documentation - errors won't affect the API
const SafeAuthTags = SafeSwaggerClassDecorator(() => {
  const { AuthTags } = require('../doc/auth/auth.swagger');
  return AuthTags;
});

const SafeAuthDecorators = {
  userRegister: SafeSwaggerDecorator(() => {
    const { AuthDecorators } = require('../doc/auth/auth.swagger');
    return AuthDecorators.userRegister;
  }),
  adminRegistration: SafeSwaggerDecorator(() => {
    const { AuthDecorators } = require('../doc/auth/auth.swagger');
    return AuthDecorators.adminRegistration;
  }),
  adminLogin: SafeSwaggerDecorator(() => {
    const { AuthDecorators } = require('../doc/auth/auth.swagger');
    return AuthDecorators.adminLogin;
  }),
  login: SafeSwaggerDecorator(() => {
    const { AuthDecorators } = require('../doc/auth/auth.swagger');
    return AuthDecorators.login;
  }),
  refreshToken: SafeSwaggerDecorator(() => {
    const { AuthDecorators } = require('../doc/auth/auth.swagger');
    return AuthDecorators.refreshToken;
  })
};

import { CustomerSendOtpDto, OtpPurpose } from './DTO/customer-send-otp.dto';
import { CustomerSignupDto } from './DTO/customer-signup.dto';
import {
  CustomerVerifyOtpDto,
  CustomerVerifyOtpLoginDto,
} from './DTO/customer-verify-otp.dto';
import { UpdateCustomerProfileDto } from './DTO/update-customer-profile.dto';
import { ChangePasswordDto } from './DTO/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(Services.AUTH) private authService: IAuthService,
  ) { }

  @Public()
  @Post('userRegister')
  @SafeAuthDecorators.userRegister
  async registerUser(@Body() createUserDTO: CreateUserDTO) {
    return await this.authService.signUpUser(createUserDTO);
  }

  @Public()
  @Post('adminRegistration')
  @SafeAuthDecorators.adminRegistration
  async adminRegistration(@Body() createAdminDTO: CreateAdminDTO) {
    return await this.authService.checkAdmin(createAdminDTO);
  }

  @Public()
  @Post('adminLogin')
  @SafeAuthDecorators.adminLogin
  async adminLogin(@Body() body: AdminLoginDTO) {
    return await this.authService.adminLogin(body);
  }

  @Public()
  @Post('login')
  @SafeAuthDecorators.login
  async login(@Body() body: LoginDto) {
    return await this.authService.login(body);
  }

  @Public()
  @Post('refreshToken')
  @SafeAuthDecorators.refreshToken
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return await this.authService.refreshToken(refreshToken);
  }

  /** Customer login with email + password (customer role only). */
  @Public()
  @Post('customer/login')
  async customerPasswordLogin(@Body() dto: CustomerPasswordLoginDto) {
    return await this.authService.customerPasswordLogin(dto.email, dto.password);
  }

  @Public()
  @Post('customer/send-otp')
  async customerSendOtp(@Body() dto: CustomerSendOtpDto) {
    return await this.authService.sendOtpForCustomer(dto.email, dto.purpose);
  }

  /** Verify OTP only. Signup → returns signupToken. Login → returns access + refresh tokens. */
  @Public()
  @Post('customer/verify-otp')
  async customerVerifyOtp(@Body() dto: CustomerVerifyOtpDto) {
    return await this.authService.verifyOtpForCustomer(
      dto.email,
      dto.otp,
      dto.purpose,
    );
  }

  /** Complete signup with name and password (use signupToken from verify-otp). */
  @Public()
  @Post('customer/signup')
  async customerSignup(@Body() dto: CustomerSignupDto) {
    return await this.authService.customerSignup(dto);
  }

  /** OTP login (same as POST customer/verify-otp with purpose=login). */
  @Public()
  @Post('customer/verify-otp-login')
  async customerVerifyOtpLogin(@Body() dto: CustomerVerifyOtpLoginDto) {
    return await this.authService.verifyOtpForCustomer(
      dto.email,
      dto.otp,
      OtpPurpose.LOGIN,
    );
  }

  // ==============================
  // CUSTOMER PROFILE (JWT required)
  // ==============================

  /** List of Ghibli-style avatars for personality/profile photo. */
  @Public()
  @Get('customer/avatars')
  getGhibliAvatars() {
    return this.authService.getGhibliAvatars();
  }

  /** Get my profile (customer only). */
  @Get('customer/profile')
  async getCustomerProfile(@Req() req: { user: { id: string } }) {
    return await this.authService.getCustomerProfile(req.user.id);
  }

  /** Update my profile: name and/or Ghibli avatar (avatarId or avatarUrl). */
  @Patch('customer/profile')
  async updateCustomerProfile(
    @Req() req: { user: { id: string } },
    @Body() dto: UpdateCustomerProfileDto,
  ) {
    return await this.authService.updateCustomerProfile(req.user.id, dto);
  }

  /** Change password (customer only, JWT required). */
  @Patch('customer/change-password')
  async changeCustomerPassword(
    @Req() req: { user: { id: string } },
    @Body() dto: ChangePasswordDto,
  ) {
    return await this.authService.changeCustomerPassword(req.user.id, dto);
  }
}
