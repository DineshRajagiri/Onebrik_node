import { Module } from '@nestjs/common';
import { NeftService } from './neft.service';
import { NeftController } from './neft.controller';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { entities } from 'src/utils/entities';
import { NotificationModule } from 'src/notification/notification.module';
import { CommonModule } from 'src/common/common.module';
import { Services } from 'src/utils/constants';

@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot(),
    MongooseModule.forFeature(entities),
    NotificationModule,
    CommonModule
  ],

  providers: [
    {
      provide: Services.NEFT,
      useClass: NeftService
    }
  ],
  exports: [
    {
      provide: Services.NEFT,
      useClass: NeftService
    }
  ],
  controllers: [NeftController]
})
export class NeftModule { }
