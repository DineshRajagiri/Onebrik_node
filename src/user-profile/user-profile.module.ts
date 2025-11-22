import { Module } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { UserProfileController } from './user-profile.controller';
import { Services } from 'src/utils/constants';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { entities } from 'src/utils/entities';
import { NotificationModule } from 'src/notification/notification.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature(entities),
    NotificationModule,
    CommonModule
  ],
  controllers: [UserProfileController],
  providers: [
    {
      provide: Services.USERPROFILE,
      useClass: UserProfileService
    }
  ],
  exports: [
    {
      provide: Services.USERPROFILE,
      useClass: UserProfileService
    }
  ]
})
export class UserProfileModule {}
