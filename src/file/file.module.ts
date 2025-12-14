import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { Services } from 'src/utils/constants';
import { CommonModule } from 'src/common/common.module';
import { NotificationModule } from 'src/notification/notification.module';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { entities } from 'src/utils/entities';


@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature(entities),
    NotificationModule,
    CommonModule
  ],
  controllers: [FileController],
  providers: [
    {
      provide: Services.FILE,
      useClass: FileService
    }
  ],
  exports: [
    {
      provide: Services.FILE,
      useClass: FileService
    }
  ]
})
export class FileModule {}
