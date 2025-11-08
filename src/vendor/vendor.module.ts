import { Module } from '@nestjs/common';
import { VendorController } from './vendor.controller';
import { VendorService } from './vendor.service';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationModule } from 'src/notification/notification.module';
import { CommonModule } from 'src/common/common.module';
import { Services } from 'src/utils/constants';
import { entities } from 'src/utils/entities';

@Module({
  imports:[
    HttpModule,
    MongooseModule.forFeature(entities),
    NotificationModule,
    CommonModule
  ],
  controllers: [VendorController],
  providers: [
    {
    provide:Services.VENDOR,
    useClass:VendorService
  }
],
exports: [
  {
    provide: Services.VENDOR,
    useClass: VendorService
  }
]
})
export class VendorModule {}

