import { Body, Controller, Get, Inject, Patch, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Public } from 'src/decorators/public.decorator';
import { CustomerAuthService } from './customer-auth.service';
import { CustomerLoginDto } from './DTO/customer-login.dto';
import { CustomerVerifyOtpDto } from './DTO/customer-verify-otp.dto';
import { UpdateCustomerProfileDto } from './DTO/update-customer-profile.dto';
import { Services } from 'src/utils/constants';
import { diskStorage, memoryStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { AwsS3BucketService } from 'src/common/services/aws-s3-bucket/aws-s3-bucket.service';


@Controller('customer-auth')
export class CustomerAuthController {
    constructor(
        @Inject(Services.CUSTOMER_AUTH) private customerService: CustomerAuthService,
        private readonly awsS3BucketService: AwsS3BucketService,) { }


    // =========================
    // SEND OTP
    // =========================

    @Post('login')
    @Public()
    async login(@Body() dto: CustomerLoginDto) {
        return this.customerService.sendOtp(dto.email);
    }

    @Post('verify')
    @Public()
    async verify(@Body() dto: CustomerVerifyOtpDto) {
        return this.customerService.verifyOtp(dto.email, dto.otp);
    }

    // =========================
    // GET PROFILE
    // =========================

    @Get('profile')
    async getProfile(@Req() req: any) {
        return this.customerService.getProfile(req.user.sub);
    }

    // =========================
    // UPDATE PROFILE
    // =========================
    @Patch('profile')
    @UseInterceptors(
        FileInterceptor('image', {
            storage: memoryStorage(),
        }),
    )
    async upsertProfile(
        @Req() req,
        @UploadedFile() file: Express.Multer.File,
        @Body() dto: UpdateCustomerProfileDto,
    ) {

        let imageUrl: string | undefined;

        if (file) {
            imageUrl = await this.awsS3BucketService.uploadFile(file, 'customer-profile');
        }

        return this.customerService.upsertProfile(req.user.sub, dto, imageUrl);
    }
}
