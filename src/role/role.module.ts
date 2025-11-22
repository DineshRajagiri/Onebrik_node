import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { Services } from 'src/utils/constants';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationModule } from 'src/notification/notification.module';
import { CommonModule } from 'src/common/common.module';
import { entities } from 'src/utils/entities';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature(entities),
    NotificationModule,
    CommonModule
  ],
  controllers: [RoleController],
  providers: [
    {
      provide: Services.ROLE,
      useClass: RoleService
    }
  ],
  exports: [
    {
      provide: Services.ROLE,
      useClass: RoleService
    }
  ]
})
export class RoleModule {}
