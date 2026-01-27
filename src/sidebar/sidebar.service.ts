import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { SidebarChildDto } from './dto/sidebar.dto';
import { Sidebar, SidebarDocument } from 'src/schema/sidebar.scehma';

@Injectable()
export class SidebarService {
  constructor(
    @InjectModel(Sidebar.name)
    private readonly sidebarModel: Model<SidebarDocument>,
  ) {}

  /* -------- CREATE ONE MENU GROUP WITH ObjectIds -------- */
  async create(dto: SidebarChildDto) {
    const menuWithIds = this.addObjectIds(dto);
    return this.sidebarModel.create(menuWithIds);
  }

  /* -------- GET ALL -------- */
  findAll() {
    return this.sidebarModel.find().lean();
  }

  /* -------- RECURSIVE ObjectId GENERATOR -------- */
  private addObjectIds(menu: SidebarChildDto): any {
    return {
      _id: new Types.ObjectId(),
      ...menu,
      children: menu.children?.map(child => this.addObjectIds(child)) || [],
    };
  }
}
