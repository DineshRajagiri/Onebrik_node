import { Module } from '@nestjs/common';
import { DealsService } from './deals.service';
import { DealsController } from './deals.controller';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from 'src/common/common.module';
import { NotificationModule } from 'src/notification/notification.module';
import { entities } from 'src/utils/entities';
import { Services } from 'src/utils/constants';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports:[
    HttpModule,
    ScheduleModule.forRoot(),
    MongooseModule.forFeature(entities),
    NotificationModule,
    CommonModule
  ],
    controllers: [DealsController],
    providers: [
      {
        provide:Services.DEALS,
        useClass:DealsService
      }
    ],
      exports: [
        {
          provide: Services.DEALS,
          useClass: DealsService 
        }
      ]
})
export class DealsModule {}
