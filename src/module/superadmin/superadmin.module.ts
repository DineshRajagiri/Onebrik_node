import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from 'src/common/common.module';
import { entities } from 'src/utils/entities';
import { SuperAdminController } from './superadmin.controller';
import { SuperAdminService } from './superadmin.service';

@Module({
  imports:[
    HttpModule,
    MongooseModule.forFeature(entities),
    CommonModule
  ],
  controllers: [SuperAdminController],
  providers: [SuperAdminService]

})
export class SuperAdminModule {}
