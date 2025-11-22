import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from 'src/common/common.module';
import { entities } from 'src/utils/entities';
import {  UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Services } from 'src/utils/constants';
import { AuthModule } from 'src/auth/auth.module';
import { SuperAdminSeeder } from 'src/seeder/super-admin.seeder';

@Module({
    imports: [
      CommonModule, 
      MongooseModule.forFeature(entities),
      // AuthModule,
      forwardRef(() => AuthModule),
    ],
    providers: [
      {
        provide: Services.USERS,
        useClass: UsersService,
      },
      SuperAdminSeeder   
    ],
    controllers: [UsersController],
    exports: [
      {
        provide: Services.USERS,
        useClass: UsersService,
      },
    ],
})
export class UsersModule {}
