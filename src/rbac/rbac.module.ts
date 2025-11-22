import { Module } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { RbacController } from './rbac.controller';
import { Services } from 'src/utils/constants';
import { CommonModule } from 'src/common/common.module';
import { NotificationModule } from 'src/notification/notification.module';
import { MongooseModule } from '@nestjs/mongoose';
import { entities } from 'src/utils/entities';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature(entities),
    NotificationModule,
    CommonModule
  ],
  controllers: [RbacController],
  providers: [
    {
      provide: Services.RBAC,
      useClass: RbacService
    }
  ],
  exports: [
    {
      provide: Services.RBAC,
      useClass: RbacService
    }
  ]
})
export class RbacModule {}
