import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Param, Post, Put, Query, Search, UseGuards } from '@nestjs/common';
import { moduleDTO } from './DTO/module.dto';
import { Services } from 'src/utils/constants';
import { ISidebarService } from './sidebar';
import { subModuleDTO } from './DTO/subModule.dto';
import { AssignPermissionsDto } from './DTO/permission.dto';
import { roleDTO } from './DTO/role.dto';
import { subModuleChildDTO } from './DTO/subModuleChild.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { query } from 'express';

@Controller('sidebar')
export class SidebarController {

    constructor(
        @Inject(Services.SIDEBAR) private sidebarService: ISidebarService,
    ) { }
    //module//
    @Get('getAllModuleList')
    async getAllModules(@Query('page') page?: string, @Query('limit') limit?: string, @Query('search') Search?: string) {
        const pageNumber = page ? parseInt(page, 10) : 1;
        const pageSize = limit ? parseInt(limit, 10) : 10;
        return this.sidebarService.getAllModules(pageNumber, pageSize, Search);
    }

    @Get('modulesList')
    async getModulesList() {
        return this.sidebarService.modulesList();
    }

    @Put('updateModule/:id')
    async updateModule(@Param('id') id: string, @Body() body: moduleDTO) {
        return await this.sidebarService.updateModule(id, body);
    }

    @Get('getModuleById/:id')
    async getModuleById(@Param('id') id: string) {
        return this.sidebarService.getModuleById(id);
    }

    @Delete('deleteModule/:id')
    async deleteModule(@Param('id') id: string) {
        return await this.sidebarService.deleteModule(id);
    }
    @Post('createModule')
    async createModules(@Body() body: moduleDTO) {
        return await this.sidebarService.createModules(body)
    }


    //sub Module//
    @Get('getAllSubModuleList')
    async getAllSubModules(@Query('page') page?: string, @Query('limit') limit?: string, @Query('search') Search?: string) {
        const pageNumber = page ? parseInt(page, 10) : 1;
        const pageSize = limit ? parseInt(limit, 10) : 10;
        return this.sidebarService.getAllSubModules(pageNumber, pageSize, Search);
    }
    @Post('createsubmodules')
    async createsubmodules(@Body() body: subModuleDTO) {
        return await this.sidebarService.createsubmodules(body)
    }

    @Put('updateSubModule/:id')
    async updateSubModule(
        @Param('id') id: string,
        @Body() updateData: subModuleDTO
    ) {
        return this.sidebarService.updateSubModule(id, updateData);
    }
    @Delete('deleteSubModule/:id')
    async deleteSubModule(@Param('id') id: string) {
        return this.sidebarService.deleteSubModule(id);
    }
    @Get('getSubModuleById/:id')
    async getSubModuleById(@Param('id') id: string) {
        return this.sidebarService.getSubModuleById(id);
    }

    //subModuleChild//
    @Get('getAllSubModuleChildList')
    async getAllSubChildModules(@Query('page') page?: string, @Query('limit') limit?: string, @Query('search') Search?: string) {
        const pageNumber = page ? parseInt(page, 10) : 1;
        const pageSize = limit ? parseInt(limit, 10) : 10;
        return this.sidebarService.getAllSubChildModules(pageNumber, pageSize, Search);
    }

    @Post('createsubmoduleChild')
    async createsubmoduleChild(@Body() body: subModuleChildDTO) {
        return await this.sidebarService.createsubmoduleChild(body)
    }

    @Put('/updateSubModuleChild/:id')
    async updateSubModuleChild(
        @Param('id') id: string,
        @Body() updateData: subModuleChildDTO) {
        return this.sidebarService.updateSubModuleChild(id, updateData);
    }

    @Delete('deleteSubModuleChild/:id')
    async deleteSubModuleChild(@Param('id') id: string) {
        return this.sidebarService.deleteSubModuleChild(id);
    }
    @Get('getSubModuleChildById/:id')
    async getSubModuleChildById(@Param('id') id: string) {
        return this.sidebarService.getSubModuleChildById(id);
    }

    //permissions//
    // @Post('createPermission')
    // async createPermission(@Body() body: permissionDTO) {
    //     return await this.sidebarService.createPermission(body)
    // }
    // @Get('getAllPermissions')
    // async getAllPermissions(
    //     @Query('page') page?: string, @Query('limit') limit?: string, @Query('search') Search?: string) {
    //     const pageNumber = page ? parseInt(page, 10) : 1;
    //     const pageSize = limit ? parseInt(limit, 10) : 10;
    //     return await this.sidebarService.getAllPermissions(pageNumber, pageSize, Search);
    // }
    // @Put('updatePermission/:id')
    // async updatePermission(
    //     @Param('id') id: string,
    //     @Body() updateData: permissionDTO
    // ) {
    //     return await this.sidebarService.updatePermission(id, updateData);
    // }
    @Delete('deletePermission/:id')
    async deletePermission(@Param('id') id: string) {
        return await this.sidebarService.deletePermission(id);
    }
    @Get('getPermissionById/:id')
    async getPermissionById(@Param('id') id: string) {
        return this.sidebarService.getPermissionById(id);
    }


    // Roles//
    @Post('createRoles')
    async createRoles(@Body() body: roleDTO) {
        return await this.sidebarService.createRoles(body)
    }
    @Get('getAllRoles')
    async getAllRoles(@Query('page') page: number, @Query('limit') limit: number, @Query('search') search: string) {
        return await this.sidebarService.getAllRoles(page, limit, search);
    }
    @Put('updateRole/:id')
    async updateRole(
        @Param('id') id: string,
        @Body() updateData: Partial<roleDTO>
    ) {
        return await this.sidebarService.updateRole(id, updateData);
    }
    @Delete('deleteRole/:id')
    async deleteRole(@Param('id') id: string) {
        return await this.sidebarService.deleteRole(id);
    }
    @Get('getRoleById/:id')
    async getRoleById(@Param('id') id: string) {
        return this.sidebarService.getRoleById(id);
    }

    // @UseGuards(JwtAuthGuard)
    @Get('getSidebar/:id')
    async getSidebar(@Param('id') userId: string) {
        return await this.sidebarService.getSidebarForAdmin(userId);
    }

    @Post('/assign-permissions')
    async assignPermissions(@Body() assignPermissionsDto: AssignPermissionsDto) {
      return this.sidebarService.assignPermissions(assignPermissionsDto);
    }

    @Get('/all-modules')
    async getAllModulesWithDefaultPermissions() {
      try {
        return await this.sidebarService.getAllModulesWithDefaultPermissions();
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
    
}
