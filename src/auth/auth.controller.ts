import { Body, Controller, Get, Inject, Patch, Post, Req } from '@nestjs/common';
import { Services } from 'src/utils/constants';
import { IAuthService } from './auth';
import { CreateUserDTO } from './DTO/createUser.dto';
import { CreateAdminDTO } from './DTO/createAdmin.dto';
import { AdminLoginDTO } from './DTO/adminLogin.dto';
import { Public } from 'src/decorators/public.decorator';
import { LoginDto } from './DTO/login.dto';
import { CustomerPasswordLoginDto } from './DTO';
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
  async registerUser(@Body() createUserDTO: CreateUserDTO) {
    return await this.authService.signUpUser(createUserDTO);
  }

  @Public()
  @Post('adminRegistration')
  async adminRegistration(@Body() createAdminDTO: CreateAdminDTO) {
    return await this.authService.checkAdmin(createAdminDTO);
  }

  @Public()
  @Post('adminLogin')
  async adminLogin(@Body() body: AdminLoginDTO) {
    return await this.authService.adminLogin(body);
  }

  @Public()
  @Post('login')
  async login(@Body() body: LoginDto) {
    return await this.authService.login(body);
  }

  @Public()
  @Post('refreshToken')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return await this.authService.refreshToken(refreshToken);
  }

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

  @Public()
  @Post('customer/verify-otp')
  async customerVerifyOtp(@Body() dto: CustomerVerifyOtpDto) {
    return await this.authService.verifyOtpForCustomer(
      dto.email,
      dto.otp,
      dto.purpose,
    );
  }

  @Public()
  @Post('customer/signup')
  async customerSignup(@Body() dto: CustomerSignupDto) {
    return await this.authService.customerSignup(dto);
  }

  @Public()
  @Post('customer/verify-otp-login')
  async customerVerifyOtpLogin(@Body() dto: CustomerVerifyOtpLoginDto) {
    return await this.authService.verifyOtpForCustomer(
      dto.email,
      dto.otp,
      OtpPurpose.LOGIN,
    );
  }

  @Public()
  @Get('customer/avatars')
  getGhibliAvatars() {
    return this.authService.getGhibliAvatars();
  }

  @Get('customer/profile')
  async getCustomerProfile(@Req() req: { user: { id: string } }) {
    return await this.authService.getCustomerProfile(req.user.id);
  }

  @Patch('customer/profile')
  async updateCustomerProfile(
    @Req() req: { user: { id: string } },
    @Body() dto: UpdateCustomerProfileDto,
  ) {
    return await this.authService.updateCustomerProfile(req.user.id, dto);
  }

  @Patch('customer/change-password')
  async changeCustomerPassword(
    @Req() req: { user: { id: string } },
    @Body() dto: ChangePasswordDto,
  ) {
    return await this.authService.changeCustomerPassword(req.user.id, dto);
  }
}
