import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { entities } from 'src/utils/entities';
import { NotificationModule } from 'src/notification/notification.module';
import { CommonModule } from 'src/common/common.module';
import { DeliveryController } from './delivery.controller';
import { Services } from 'src/utils/constants';
import { DeliveryService } from './delivery.service';

@Module({
   imports:[
      HttpModule,
      MongooseModule.forFeature(entities),
      NotificationModule,
      CommonModule
    ],
  controllers: [DeliveryController],
  providers: [
     {
       provide:Services.DELIVERYBOY,
       useClass:DeliveryService
     }
   ],
   exports: [
    {
      provide: Services.DELIVERYBOY,
      useClass: DeliveryService
    }
  ]

})
export class DeliveryModule {}
