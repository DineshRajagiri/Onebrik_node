import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationModule } from 'src/notification/notification.module';
import { CommonModule } from 'src/common/common.module';
import { Services } from 'src/utils/constants';
import { entities } from 'src/utils/entities';
import { AuthModule } from 'src/auth/auth.module';
import { PaymentGatewayModule } from 'src/module/payment-gateway/payment-gateway.module';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature(entities),
    NotificationModule,
    CommonModule,
    AuthModule,
    PaymentGatewayModule,
  ],
  controllers: [CustomerController],
  providers: [
    {
      provide: Services.CUSTOMER,
      useClass: CustomerService,
    },
  ],
  exports: [
    {
      provide: Services.CUSTOMER,
      useClass: CustomerService,
    },
  ],
})
export class CustomerModule {}

