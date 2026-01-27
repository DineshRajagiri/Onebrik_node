import { Body, Controller, Inject, Post } from '@nestjs/common';
import { Services } from 'src/utils/constants';
import { IAuthService } from './auth';
import { AuthResponse } from 'src/common/decorators/response.decorator';
import { CreateUserDTO } from './DTO/createUser.dto';
import { CreateAdminDTO } from './DTO/createAdmin.dto';
import { AdminLoginDTO } from './DTO/adminLogin.dto';
import { VerifyOtpDto } from './DTO/verifyOtp.dto';
import { Public } from 'src/decorators/public.decorator';
import { AadharDTO } from './DTO/aadhar.dto';
import { PanDTO } from './DTO/pan.dto';
import { LoginDto } from './DTO/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(Services.AUTH) private authService: IAuthService,
  ) { }

  @Public()
  @Post('userRegister')
  // @AuthResponse('userRegister')
  async registerUser(@Body() createUserDTO: CreateUserDTO) {
    return await this.authService.signUpUser(createUserDTO);
  }

  @Public()
  @Post('adminRegistration')
  // @AuthResponse('adminRegistration')
  async adminRegistration(@Body() createAdminDTO: CreateAdminDTO) {
    return await this.authService.checkAdmin(createAdminDTO);
  }

  @Public()
  @Post('adminLogin')
  async adminLogin(@Body() body: AdminLoginDTO) {
    return await this.authService.adminLogin(body);
  }

  @Public()
  @Post('verifyOtp')
  async verifyOtp(@Body() body: { phoneNumber: string; logid: string; otp: string }) {
    const { phoneNumber, logid, otp } = body;
    return await this.authService.verifyOtp(phoneNumber, logid, otp);
  }

  @Public()
  @Post('verifyOtpAndSaveUser')
  async verifyOtpAndSaveUser(@Body() body: { otp: string; userData: { email: string; fullName: string, mobileNumber: string; logid: string; referralCode: string } },) {
    const { otp, userData } = body;
    return await this.authService.verifyOtpAndSaveUser(otp, userData);
  }

  // @Public()
  // @Post('login')
  // async initiateLogin(@Body('phoneNumber') phoneNumber: string) {
  //   return await this.authService.initiateLogin(phoneNumber);
  // }

  @Public()
  @Post('login')
  async login(@Body() body: LoginDto) {
    return await this.authService.login(body);
  }

  @Public()
  @Post('verifyOtpLogin')
  async verifyOtpAndLogin(@Body() verifyOtpDto: VerifyOtpDto) {
    return await this.authService.verifyOtpAndLogin(
      verifyOtpDto.phoneNumber,
      verifyOtpDto.otp,
      verifyOtpDto.logid,
    );
  }

  @Public()
  @Post('refreshToken')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return await this.authService.refreshToken(refreshToken);
  }
}
