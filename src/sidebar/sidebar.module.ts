import { Module } from '@nestjs/common';
import { SidebarController } from './sidebar.controller';
import { Services } from 'src/utils/constants';
import { SidebarService } from './sidebar.service';
import { HttpModule } from '@nestjs/axios';
import { UsersModule } from 'src/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { entities } from 'src/utils/entities';
import { NotificationModule } from 'src/notification/notification.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature(entities),
    NotificationModule,
    CommonModule
  ],
  controllers: [SidebarController],
  providers: [
    {
      provide: Services.SIDEBAR,
      useClass: SidebarService
    }
  ],
  exports: [
    {
      provide: Services.SIDEBAR,
      useClass: SidebarService
    }
  ]
})
export class SidebarModule { }
