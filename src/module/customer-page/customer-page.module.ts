import { Module } from '@nestjs/common';
import { CustomerpageController } from './customer-page.controller';
import { CustomerPageService } from './customer-page.service';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationModule } from 'src/notification/notification.module';
import { CommonModule } from 'src/common/common.module';
import { Services } from 'src/utils/constants';
import { entities } from 'src/utils/entities';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature(entities),
    CommonModule,
  ],
  controllers: [CustomerpageController],
  providers: [
    CustomerPageService
  ],
})
export class CustomerPageModule {}

