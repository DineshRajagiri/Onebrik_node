import { forwardRef, Module } from '@nestjs/common';
import { CustomerAuthService } from './customer-auth.service';
import { CustomerAuthController } from './customer-auth.controller';
import { HttpModule } from '@nestjs/axios';
import { MailModule } from 'src/mail/mail.module';
import { MongooseModule } from '@nestjs/mongoose';
import { entities } from 'src/utils/entities';
import { NotificationModule } from 'src/notification/notification.module';
import { CommonModule } from 'src/common/common.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Services } from 'src/utils/constants';
import { CustomerModule } from 'src/module/customer/customer.module';
import { AwsS3BucketService } from 'src/common/services/aws-s3-bucket/aws-s3-bucket.service';

@Module({
  imports: [
    HttpModule,
    MailModule,
    forwardRef(() => CustomerModule),
    MongooseModule.forFeature(entities),
    NotificationModule,
    CommonModule,
    ConfigModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [CustomerAuthController],
  providers: [JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: Services.CUSTOMER_AUTH,
      useClass: CustomerAuthService,
    },
    AwsS3BucketService
  ],
  exports: [
    JwtStrategy,
    {
      provide: Services.CUSTOMER_AUTH,
      useClass: CustomerAuthService,
    },
  ],

})
export class CustomerAuthModule { }
