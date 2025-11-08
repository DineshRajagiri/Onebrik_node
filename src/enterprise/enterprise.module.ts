import { Module } from '@nestjs/common';
import { EnterpriseService } from './enterprise.service';
import { EnterpriseController } from './enterprise.controller';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { entities } from 'src/utils/entities';
import { NotificationModule } from 'src/notification/notification.module';
import { CommonModule } from 'src/common/common.module';
import { Services } from 'src/utils/constants';

@Module({
   imports:[
      HttpModule,
      MongooseModule.forFeature(entities),
      NotificationModule,
      CommonModule
    ],
  controllers: [EnterpriseController],
  providers: [
     {
       provide:Services.ENTERPRISE,
       useClass:EnterpriseService
     }
   ],
   exports: [
    {
      provide: Services.ENTERPRISE,
      useClass: EnterpriseService
    }
  ]

})
export class EnterpriseModule {}
