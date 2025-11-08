import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { SidebarService } from './sidebar/sidebar.service';
import { SidebarModule } from './sidebar/sidebar.module';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationModule } from './notification/notification.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MastersModule } from './masters/masters.module';
import { EnterpriseModule } from './enterprise/enterprise.module';
import { VendorModule } from './vendor/vendor.module';
import { DealsModule } from './deals/deals.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AdminModule } from './admin/admin.module';
import { NeftModule } from './neft/neft.module';
import { BlogsModule } from './blogs/blogs.module';
import { WithdrawalModule } from './withdrawal/withdrawal.module';

@Module({
  imports: [
    AuthModule,
    SidebarModule,
    UsersModule,
    MastersModule,
    EnterpriseModule,
    VendorModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ envFilePath: '.env' }),
    HttpModule,
    NotificationModule,
    MongooseModule.forRoot(process.env.MONGODB_LOCAL_URL, {
      connectionFactory: (connection) => {
        connection.plugin(require('mongoose-autopopulate'));
        return connection;
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads', 
    }),
    DealsModule,
    AdminModule,
    NeftModule,
    BlogsModule,
    WithdrawalModule,
    

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
