import { Module } from '@nestjs/common';
import { MastersController } from './masters.controller';
import { MastersService } from './masters.service';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { entities } from 'src/utils/entities';
import { NotificationModule } from 'src/notification/notification.module';
import { CommonModule } from 'src/common/common.module';
import { Services } from 'src/utils/constants';

@Module({
  imports:[
    HttpModule,
    MongooseModule.forFeature(entities),
    NotificationModule,
    CommonModule
  ],
  controllers: [MastersController],
  providers: [
    {
      provide:Services.MASTERS,
      useClass:MastersService
    }
  ],
  exports: [
    {
      provide: Services.MASTERS,
      useClass: MastersService
    }
  ]

})
export class MastersModule {}
