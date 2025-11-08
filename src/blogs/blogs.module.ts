import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from 'src/common/common.module';
import { NotificationModule } from 'src/notification/notification.module';
import { entities } from 'src/utils/entities';
import { Services } from 'src/utils/constants';
import { ScheduleModule } from '@nestjs/schedule';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';

@Module({
  imports:[
    HttpModule,
    ScheduleModule.forRoot(),
    MongooseModule.forFeature(entities),
    NotificationModule,
    CommonModule
  ],
    controllers: [BlogsController],
    providers: [
      {
        provide:Services.BLOGS,
        useClass:BlogsService
      }
    ],
      exports: [
        {
          provide: Services.BLOGS,
          useClass: BlogsService 
        }
      ]
})
export class BlogsModule {}
