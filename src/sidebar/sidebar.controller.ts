import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { SidebarService } from './sidebar.service';
import { SidebarChildDto } from './dto/sidebar.dto';
import { Public } from 'src/decorators/public.decorator';

@Controller('sidebar')
export class SidebarController {
  constructor(private readonly sidebarService: SidebarService) {}

  @Public()
  @Post()
  create(@Body() dto: SidebarChildDto) {
    return this.sidebarService.create(dto);
  }

  
  @Public()
  @Get()
  findAll() {
    return this.sidebarService.findAll();
  }
}
