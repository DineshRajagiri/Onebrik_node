import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { CommonModule } from 'src/common/common.module';
import { MongooseModule } from '@nestjs/mongoose';
import { entities } from 'src/utils/entities';
import { Services } from '../utils/constants';
import { HttpModule } from '@nestjs/axios';
import { AwsS3BucketService } from 'src/common/services/aws-s3-bucket/aws-s3-bucket.service';

@Module({
  imports: [
    HttpModule,
    CommonModule,
    MongooseModule.forFeature(entities)
  ],
  controllers: [InventoryController],
  providers: [
    {
      provide: Services.INVENTORY,
      useClass: InventoryService

    },
   AwsS3BucketService],
  exports: [
    {
      provide: Services.INVENTORY,
      useClass: InventoryService,
    },
  ],
})

export class InventoryModule { }
