import { Body, Controller, Delete, Get, Inject, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { BaseResponse } from 'src/common/DTO/base-response.dto';
import { User } from 'src/decorators/getid.decorator';
import { Public } from 'src/decorators/public.decorator';
import { Services } from 'src/utils/constants';
import { UpsertPermissionsForRoleDto } from './DTO/bulk-update-permission-role.dto';
import { CreateAppModuleDto } from './DTO/create-module.dto';
import { IPermissionService } from './permission';
import { SafeSwaggerClassDecorator, SafeSwaggerDecorator } from 'src/common/decorators/safe-swagger.decorator';

// Safe wrapper for documentation - errors won't affect the API
const SafePermissionTags = SafeSwaggerClassDecorator(() => {
  const { PermissionTags } = require('../doc/permission/permission.swagger');
  return PermissionTags;
});

const SafePermissionDecorators = {
  createModule: SafeSwaggerDecorator(() => {
    const { PermissionDecorators } = require('../doc/permission/permission.swagger');
    return PermissionDecorators.createModule;
  }),
  bulkUpdatePermissionRole: SafeSwaggerDecorator(() => {
    const { PermissionDecorators } = require('../doc/permission/permission.swagger');
    return PermissionDecorators.bulkUpdatePermissionRole;
  })
};

@SafePermissionTags
@Controller('permission')
export class PermissionController {

  constructor(@Inject(Services.PERMISSION) private service: IPermissionService) { }

  @Public()
  @Post('module')
  @SafePermissionDecorators.createModule
  async upsertModule(@Body() dto: CreateAppModuleDto) {
    const module = await this.service.upsertModule(dto);
    return BaseResponse.ok(module, 'Module created');
  }

  @Public()
  @Get('list/:entity')
  async getList(@Param('entity') entity: string) {
    return this.service.getList(entity);
  }

  @Public()
  @Get('sidebaronly')
  async getSidebarMenu() {
    return this.service.getSidebarMenu();
  }

  @UseGuards(JwtAuthGuard)
  @Get('sidebar')
  async getSidebar(@Req() req,
    @User('id') id: string,
    @User('role') role: string) {
    console.log(id, "id");
    // if (role ==='SUPERADMIN') {
    //   return await this.service.getsidebarForadmin(id);
    // }
    const data = await this.service.getSidebarForUser(id);
    return {
      success: true,
      message: 'Sidebar loaded successfully',
      data,
    };
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
  async upsertSubModule(@Body() body: any) {
    const sub = await this.service.upsertSubModule(body);
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
  async upsertSubModuleChild(@Body() body: any) {
    const child = await this.service.upsertSubModuleChild(body);
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
  @SafePermissionDecorators.bulkUpdatePermissionRole
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

  @Post('give-permissions-sidebar')
  async givepermissions(@Body() body: any) {
   await this.service.givePermissions(body);
  }

  @Post('paginated-modules')
  async getPaginatedModules(@Body() body: { page: number; limit: number }) {
    const data = await this.service.getPaginatedModules(body.page, body.limit);
    return BaseResponse.ok(data);
  }


  
}
