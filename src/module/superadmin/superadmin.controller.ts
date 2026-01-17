import { Body, Controller, Get, Post } from '@nestjs/common';
import { Public } from 'src/decorators/public.decorator';
import { UserDTO } from './dto/user.dto';
import { SuperAdminService } from './superadmin.service';


@Controller('superadmin')
export class SuperAdminController {
    constructor(private readonly superAdminService: SuperAdminService) { }

    @Public()
    @Post('adduser')
    async adduser(@Body() body: UserDTO) {
       return  await this.superAdminService.create(body); 
    }

    @Public()
    @Get('roles')
    async getroles() {
        return await this.superAdminService.getroles();
    }
}
