import { Module } from '@nestjs/common';
import { AdminService } from './admin.service'; import { AdminController } from './admin.controller';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { entities } from 'src/utils/entities';
import { NotificationModule } from 'src/notification/notification.module';
import { CommonModule } from 'src/common/common.module';
import { Services } from 'src/utils/constants';

@Module({
    imports: [
        HttpModule,
        MongooseModule.forFeature(entities),
        NotificationModule,
        CommonModule
    ],
    controllers: [AdminController],
    providers: [
        {
            provide: Services.ADMIN,
            useClass: AdminService
        }
    ],
    exports: [
        {
            provide: Services.ADMIN,
            useClass: AdminService
        }
    ]

})
export class AdminModule { }
