import { forwardRef, Module } from '@nestjs/common';
import { TableService } from './table.service';
import { TableController } from './table.controller';
import { Services } from 'src/utils/constants';
import { AuthModule } from 'src/auth/auth.module';
import { CommonModule } from 'src/common/common.module';
import { MongooseModule } from '@nestjs/mongoose';
import { entities } from 'src/utils/entities';
import { PermissionService } from 'src/permission/permission.service';
import { RoleService } from 'src/role/role.service';

@Module({
  imports: [
    CommonModule,
    MongooseModule.forFeature(entities),
    forwardRef(() => AuthModule),
  ],
  providers: [
    {
      provide: Services.TABLE,
      useClass: TableService,
    },
    PermissionService,
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
