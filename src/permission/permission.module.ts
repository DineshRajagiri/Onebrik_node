import { Module } from '@nestjs/common';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationModule } from 'src/notification/notification.module';
import { entities } from 'src/utils/entities';
import { CommonModule } from 'src/common/common.module';
import { Services } from 'src/utils/constants';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature(entities),
    NotificationModule,
    CommonModule,
 
  ],
  controllers: [PermissionController],
  providers: [
    {
      provide: Services.PERMISSION,
      useClass: PermissionService
    }
  ],
  exports: [
    {
      provide: Services.PERMISSION,
      useClass: PermissionService
    }
  ]
})
export class PermissionModule {}
