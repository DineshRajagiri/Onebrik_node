import { Body, Controller, Delete, Get, Inject, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { BaseResponse } from 'src/common/DTO/base-response.dto';
import { User } from 'src/decorators/getid.decorator';
import { Public } from 'src/decorators/public.decorator';
import { Services } from 'src/utils/constants';
import { GetPermissionsDto, UpsertPermissionsDto, UpsertPermissionsForRoleDto } from './DTO/bulk-update-permission-role.dto';
import { CreateAppModuleDto } from './DTO/create-module.dto';
import { IPermissionService } from './permission';
import { SafeSwaggerClassDecorator, SafeSwaggerDecorator } from 'src/common/decorators/safe-swagger.decorator';
import { UpsertModuleDto } from './DTO/upsert-module.dto';
import { UpsertSubModuleDto } from './DTO/upsert-sub-module.dto';
import { UpsertSubModuleChildDto } from './DTO/upsert-submodule-child-dto';

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
  @Get('getAllModules')
  async getAllModules(@Query('page') page = 1, @Query('limit') limit = 10) {
    const result = await this.service.getPaginatedModules(Number(page), Number(limit));
    return {
      success: true, message: "Modules fetched successfully", data: result.data,
      pagination: {
        page: result.page, limit: result.limit, total: result.total, totalPages: Math.ceil(result.total / result.limit)
      }
    };
  }

  @Public()
  @Public()
  @Post('upsertModule')
  @SafePermissionDecorators.createModule
  async upsertModule(@Body() dto: UpsertModuleDto) {
    const result = await this.service.upsertModule(dto);
    return result;
  }

  @Public()
  @Get('getmodulesById/:id')
  async getmodulesById(@Param('id') id: string) {
    return this.service.getmodulesById(id);
  }

  @Public()
  @Delete('deleteModule/:id')
  async deleteModule(@Param('id') id: string) {
    await this.service.deleteModule(id);
    return BaseResponse.ok(null, 'Module deleted');
  }

  @Public()
  @Get('moduleDropdown')
  async moduleDropdown() {
    return this.service.getModuleDropdown();
  }





  @Public()
  @Get('getAllSubModules')
  async getAllSubModules(@Query('page') page = 1, @Query('limit') limit = 10) {
    const result = await this.service.getPaginatedSubModules(Number(page), Number(limit));
    return {
      success: true, message: "SubModules fetched successfully", data: result.data, pagination: { page: result.page, limit: result.limit, total: result.total, totalPages: Math.ceil(result.total / result.limit) }
    };
  }

  @Public()
  @Post('upsertSubModule')
  async upsertSubModule(@Body() dto: UpsertSubModuleDto) {
    return this.service.upsertSubModule(dto);
  }

  @Public()
  @Get('getSubModuleById/:id')
  async getSubModuleById(@Param('id') id: string) {
    return this.service.getSubModuleById(id);
  }

  @Public()
  @Delete('deleteSubModule/:id')
  async deleteSubModule(@Param('id') id: string) {
    await this.service.deleteSubModule(id);
    return BaseResponse.ok(null, 'SubModule deleted');
  }

  @Public()
  @Get('getSubModulesByModuleId/:moduleId')
  async getSubModulesByModuleId(
    @Param('moduleId') moduleId: string
  ) {
    return this.service.getSubModulesByModuleId(moduleId);
  }

  @Public()
  @Get('subModuleDropdown')
  async subModuleDropdown(
    @Query('moduleId') moduleId?: string
  ) {
    return this.service.getSubModuleDropdown(moduleId);
  }


  @Public()
  @Get('getAllSubModuleChild')
  async getAllSubModuleChild(@Query('page') page = 1, @Query('limit') limit = 10) {
    const result = await this.service.getPaginatedSubModuleChild(Number(page), Number(limit));
    return {
      success: true, message: "SubModuleChild fetched successfully", data: result.data,
      pagination: { page: result.page, limit: result.limit, total: result.total, totalPages: Math.ceil(result.total / result.limit) }
    };
  }

  @Public()
  @Post('upsertSubModuleChild')
  async upsertSubModuleChild(
    @Body() dto: UpsertSubModuleChildDto) {
    return this.service.upsertSubModuleChild(dto);
  }

  @Public()
  @Get('getSubModuleChildById/:id')
  async getSubModuleChildById(@Param('id') id: string) {
    return this.service.getSubModuleChildById(id);
  }

  @Public()
  @Delete('deleteSubModuleChild/:id')
  async deleteSubModuleChild(@Param('id') id: string) {
    return this.service.deleteSubModuleChild(id);
  }


  @Public()
  @Get('getSubModuleChildBySubModuleId/:subModuleId')
  async getSubModuleChildBySubModuleId(
    @Param('subModuleId') subModuleId: string
  ) {
    return this.service.getSubModuleChildrenBySubModuleId(subModuleId);
  }

  @Public()
  @Get('subChildModuleDropdown')
  async subChildModuleDropdown(
    @Query('subModuleId') subModuleId?: string
  ) {
    return this.service.getSubModuleChildDropdown(subModuleId);
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
  @Get('module-tree')
  async getModuleTree() {
    const data = await this.service.getModuleTree();
    return BaseResponse.ok(data);
  }

  // @Public()
  // @Post('role-permissions')
  // @SafePermissionDecorators.bulkUpdatePermissionRole
  // async upsertPermissions(@Body() dto: UpsertPermissionsForRoleDto) {
  //   const data = await this.service.upsertPermissionsForRole(dto);
  //   return BaseResponse.ok(data, 'Permissions updated for role');
  // }

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

  @Public()
  @Post('upsertPermissions')
  async upsertPermissions(@Body() dto: UpsertPermissionsDto) {
    return this.service.upsertPermissions(dto);
  }

  @Public()
  @Post('getPermissions')
  async getPermissions(@Body() dto: GetPermissionsDto) {
    return this.service.getPermissions(dto);
  }

  @Public()
  @Post('getPermissionTemplate')
  async getPermissionTemplate() {
    return this.service.getPermissionTemplate();
  }

}
