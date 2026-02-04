import { Body, Controller, Inject, Post } from '@nestjs/common';
import { Services } from 'src/utils/constants';
import { IAuthService } from './auth';
import { CreateUserDTO } from './DTO/createUser.dto';
import { CreateAdminDTO } from './DTO/createAdmin.dto';
import { AdminLoginDTO } from './DTO/adminLogin.dto';
import { Public } from 'src/decorators/public.decorator';
import { LoginDto } from './DTO/login.dto';
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

@SafeAuthTags
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
}
