import { Module } from '@nestjs/common';
import { WithdrawalController } from './withdrawal.controller';
import { WithdrawalService } from './withdrawal.service';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { CommonModule } from 'src/common/common.module';
import { NotificationModule } from 'src/notification/notification.module';
import { Services } from 'src/utils/constants';
import { entities } from 'src/utils/entities';
@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot(),
    MongooseModule.forFeature(entities),
    NotificationModule,
    CommonModule
  ],

  providers: [
    {
      provide: Services.WITHDRAWAL,
      useClass: WithdrawalService
    }
  ],
  exports: [
    {
      provide: Services.WITHDRAWAL,
      useClass: WithdrawalService
    }
  ],
  controllers: [WithdrawalController]
})
export class WithdrawalModule {}
