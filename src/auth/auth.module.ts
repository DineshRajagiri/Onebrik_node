import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Services } from 'src/utils/constants';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { entities } from 'src/utils/entities';
import { UsersModule } from 'src/users/users.module';
import { CommonModule } from 'src/common/common.module';
import { NotificationModule } from 'src/notification/notification.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt.guard';
import { APP_GUARD } from '@nestjs/core';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    HttpModule,
    MailModule,
    forwardRef(() => UsersModule),
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
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, 
    },
    {
      provide: Services.AUTH,
      useClass: AuthService,
    },
  ],
  exports: [
    JwtStrategy,
    {
      provide: Services.AUTH,
      useClass: AuthService,
    },
  ],
})
export class AuthModule {}
