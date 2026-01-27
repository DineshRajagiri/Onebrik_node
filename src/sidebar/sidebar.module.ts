import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SidebarController } from './sidebar.controller';
import { SidebarService } from './sidebar.service';
import { Sidebar, SidebarSchema } from 'src/schema/sidebar.scehma';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sidebar.name, schema: SidebarSchema }
    ])
  ],
  controllers: [SidebarController],
  providers: [SidebarService],
})
export class SidebarModule {}
