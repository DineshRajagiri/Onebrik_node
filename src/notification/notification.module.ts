import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { Services } from 'src/utils/constants';
import { MongooseModule } from '@nestjs/mongoose';
import { entities } from 'src/utils/entities';

@Module({
  imports:[MongooseModule.forFeature(entities)],
  providers: [
    {
      provide: Services.NOTIFICATION,
      useClass: NotificationService

    }],
  exports: [
    {
      provide: Services.NOTIFICATION,
      useClass: NotificationService

    }
  ],
  controllers: [NotificationController]
})
export class NotificationModule { }
