import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
// import { SidebarModule } from './sidebar/sidebar.module';
import { UsersModule } from './users/users.module';
import { HttpModule } from '@nestjs/axios';
import { NotificationModule } from './notification/notification.module';
import { MastersModule } from './masters/masters.module';
import { VendorModule } from './vendor/vendor.module';
import { AdminModule } from './admin/admin.module';

import { DeliveryModule } from './deliveryPartner/delivery.module';
import { RbacModule } from './rbac/rbac.module';
import { CoreModule } from './core/core/core.module';
import { RoleModule } from './role/role.module';
import { UserProfileModule } from './user-profile/user-profile.module';
import { SuperAdminSeeder } from './seeder/super-admin.seeder';
import { PermissionModule } from './permission/permission.module';
import { TableModule } from './table/table.module';
import { InventoryModule } from './inventory/inventory.module';
import { FileModule } from './file/file.module';
import { SidebarModule } from './sidebar/sidebar.module';
import { SuperAdminModule } from './module/superadmin/superadmin.module';
import { MailModule } from './mail/mail.module';
import { CustomerModule } from './module/customer/customer.module';
import { CustomerPageModule } from './module/customer-page/customer-page.module';
import { PaymentGatewayModule } from './module/payment-gateway/payment-gateway.module';
import { CustomerAuthModule } from './customerAuth/customer-auth.module';

@Module({
  imports: [
    CustomerAuthModule,
    SuperAdminModule,
    CoreModule,
    AuthModule,
    // SidebarModule,
    UsersModule,
    MastersModule,
    VendorModule,
    HttpModule,
    NotificationModule,
    AdminModule,
    DeliveryModule,
    RbacModule,
    RoleModule,
    UserProfileModule,
    PermissionModule,
    TableModule,
    InventoryModule,
    FileModule,
    SidebarModule,
    MailModule,
    CustomerModule,
    CustomerPageModule,
    PaymentGatewayModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
