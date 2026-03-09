import {Body,Controller,Get,Inject,Patch,Post,Req,UploadedFile,UseGuards,UseInterceptors,} from '@nestjs/common';
import { Public } from 'src/decorators/public.decorator';
import { CustomerAuthService } from './customer-auth.service';
import { CustomerLoginDto } from './DTO/customer-login.dto';
import { CustomerVerifyOtpDto } from './DTO/customer-verify-otp.dto';
import { UpdateCustomerProfileDto } from './DTO/update-customer-profile.dto';
import { Services } from 'src/utils/constants';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AwsS3BucketService } from 'src/common/services/aws-s3-bucket/aws-s3-bucket.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('customer-auth')
export class CustomerAuthController {

  constructor(
    @Inject(Services.CUSTOMER_AUTH)
    private readonly customerService: CustomerAuthService,

    private readonly awsS3BucketService: AwsS3BucketService,
  ) {}

  // =========================
  // SEND OTP
  // =========================

  @Post('login')
  @Public()
  async login(@Body() dto: CustomerLoginDto) {
    return this.customerService.sendOtp(dto.email);
  }

  // =========================
  // VERIFY OTP
  // =========================

  @Post('verify')
  @Public()
  async verify(@Body() dto: CustomerVerifyOtpDto) {
    return this.customerService.verifyOtp(dto.email, dto.otp);
  }

  // =========================
  // REFRESH TOKEN
  // =========================

  @Post('refresh')
  @Public()
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.customerService.refreshToken(refreshToken);
  }

  // =========================
  // GET PROFILE
  // =========================

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req: any) {

    console.log('JWT USER:', req.user);

    const customerId = req.user.id;

    return this.customerService.getProfile(customerId);
  }

  // =========================
  // UPDATE PROFILE
  // =========================

  @Patch('profile')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
    }),
  )
  async upsertProfile(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UpdateCustomerProfileDto,
  ) {

    const customerId = req.user.id;

    let imageUrl: string | undefined;

    if (file) {
      imageUrl = await this.awsS3BucketService.uploadFile(
        file,
        'customer-profile',
      );
    }

    return this.customerService.upsertProfile(
      customerId,
      dto,
      imageUrl,
    );
  }
}