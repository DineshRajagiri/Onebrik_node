import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Services } from 'src/utils/constants';
import { IRoleService } from './role';
import { Public } from 'src/decorators/public.decorator';
import { BaseResponse } from 'src/common/DTO/base-response.dto';
import { UpsertRoleDto } from './DTO/upsert-role.dto';

@Controller('role')
export class RoleController {
  constructor(
    @Inject(Services.ROLE) private service: IRoleService,
  ) { }

  @Public()
  @Post('createRole')
  async create(@Body() dto: CreateRoleDto) {
    const role = await this.service.create(dto);
    return BaseResponse.ok(role, 'Role created successfully');
  }

  @Public()
  @Post('role')
  async upsertRole(@Body() dto: UpsertRoleDto) {
    const role = await this.service.upsertRole(dto);
    return BaseResponse.ok(role, dto.id ? 'Role updated successfully' : 'Role created successfully');
  }

  @Get()
  async findAll() {
    const roles = await this.service.getPaginatedRoles();
    return BaseResponse.ok(roles);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const role = await this.service.findOne(id);
    return BaseResponse.ok(role);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    const role = await this.service.update(id, dto);
    return BaseResponse.ok(role, 'Role updated successfully');
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return BaseResponse.ok(null, 'Role deleted successfully');
  }


}
