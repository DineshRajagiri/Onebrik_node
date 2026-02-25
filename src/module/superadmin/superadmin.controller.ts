import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { Public } from 'src/decorators/public.decorator';
import { UserDTO } from './dto/user.dto';
import { SuperAdminService } from './superadmin.service';


@Controller('superadmin')
export class SuperAdminController {
    constructor(private readonly superAdminService: SuperAdminService) { }

    @Public()
    @Post('adduser')
    async adduser(@Body() body: UserDTO) {
        return await this.superAdminService.create(body);
    }

    @Public()
    @Get('roles')
    async getroles() {
        return await this.superAdminService.getroles();
    }


    @Public()
    @Post('users_new')
    async getusers() {
        return await this.superAdminService.getusers();
    }

    @Public()
    @Post('Upsertusers')
    async upsertUser(@Body() dto: UserDTO) {
        return await this.superAdminService.upsert(dto);
    }

    @Public()
    @Get('getAllUsers')
    async getAllUsers(@Query('page') page = 1, @Query('limit') limit = 10, @Query('search') search?: string,) {
        return await this.superAdminService.getAllUsers(Number(page), Number(limit), search);
    }

    @Public()
    @Get('getUserById/:id')
    async getUserById(@Param('id') id: string) {
        return await this.superAdminService.getUserById(id);
    }

    @Public()
    @Delete('deleteUser/:id')
    async deleteUser(@Param('id') id: string) {
        return await this.superAdminService.deleteUser(id);
    }
}
