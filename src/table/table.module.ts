import { forwardRef, Module } from '@nestjs/common';
import { TableService } from './table.service';
import { TableController } from './table.controller';
import { Services } from 'src/utils/constants';
import { AuthModule } from 'src/auth/auth.module';
import { CommonModule } from 'src/common/common.module';
import { MongooseModule } from '@nestjs/mongoose';
import { entities } from 'src/utils/entities';
import { PermissionService } from 'src/permission/permission.service';
import { InventoryService } from 'src/inventory/inventory.service';
import { RoleService } from 'src/role/role.service';
import { SuperAdminService } from 'src/module/superadmin/superadmin.service';
import { SuperAdminModule } from 'src/module/superadmin/superadmin.module';

@Module({
  imports: [
    CommonModule,
    MongooseModule.forFeature(entities),
    forwardRef(() => AuthModule),
    SuperAdminModule
  ],
  providers: [
    {
      provide: Services.TABLE,
      useClass: TableService,
    },
    PermissionService,
    InventoryService,
    RoleService
  ],
  controllers: [TableController],
  exports: [
    {
      provide: Services.TABLE,
      useClass: TableService,
    },
  ],
})
export class TableModule { }
