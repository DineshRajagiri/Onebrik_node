import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { Services } from 'src/utils/constants';
import { IPermissionService } from './permission';
import { Public } from 'src/decorators/public.decorator';
import { BaseResponse } from 'src/common/DTO/base-response.dto';
import { CreateAppModuleDto } from './DTO/create-module.dto';
import { UpsertPermissionsForRoleDto } from './DTO/bulk-update-permission-role.dto';

@Controller('permission')
export class PermissionController {

  constructor(@Inject(Services.PERMISSION) private service: IPermissionService) { }

  @Public()
  @Post('module')
  async upsertModule(@Body() dto: CreateAppModuleDto) {
    const module = await this.service.upsertModule(dto);
    return BaseResponse.ok(module, 'Module created');
  }

  @Public()
  @Get('sidebar')
  async getSidebarMenu() {
    return this.service.getSidebarMenu();
  }

  @Public()
  @Get('module')
  async getModules() {
    const modules = await this.service.getModules();
    return BaseResponse.ok(modules);
  }

  @Public()
  @Delete('module/:id')
  async deleteModule(@Param('id') id: string) {
    await this.service.deleteModule(id);
    return BaseResponse.ok(null, 'Module deleted');
  }

  @Public()
  @Post('submodule')
  async createSubModule(@Body() body: any) {
    const sub = await this.service.createSubModule(body);
    return BaseResponse.ok(sub, 'SubModule created');
  }

  @Public()
  @Get('submodule')
  async getSubModules(@Query('moduleId') moduleId?: string) {
    const list = await this.service.getSubModules(moduleId);
    return BaseResponse.ok(list);
  }

  @Delete('submodule/:id')
  async deleteSubModule(@Param('id') id: string) {
    return this.service.deleteSubModule(id);
  }

  @Public()
  @Post('submodule-child')
  async createSubModuleChild(@Body() body: any) {
    const child = await this.service.createSubModuleChild(body);
    return BaseResponse.ok(child, 'SubModuleChild created');
  }

  @Public()
  @Get('submodule-child')
  async getSubModuleChildren(@Query('subModuleId') subModuleId?: string) {
    const list = await this.service.getSubModuleChildren(subModuleId);
    return BaseResponse.ok(list);
  }


  @Delete('submodule/child/:id')
  deleteSubModuleChild(@Param('id') id: string) {
    return this.service.deleteSubModuleChild(id);
  }

  @Public()
  @Get('module-tree')
  async getModuleTree() {
    const data = await this.service.getModuleTree();
    return BaseResponse.ok(data);
  }


  @Public()
  @Post('role-permissions')
  async upsertPermissions(@Body() dto: UpsertPermissionsForRoleDto) {
    const data = await this.service.upsertPermissionsForRole(dto);
    return BaseResponse.ok(data, 'Permissions updated for role');
  }

  @Public()
  @Get('role-permissions/:roleId')
  async getPermissionsByRole(@Param('roleId') roleId: string) {
    const data = await this.service.getPermissionsByRole(roleId);
    return BaseResponse.ok(data);
  }
}
