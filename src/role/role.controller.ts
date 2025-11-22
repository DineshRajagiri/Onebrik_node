import { Body, Controller, Inject, Post } from '@nestjs/common';
import { Public } from 'src/decorators/public.decorator';
import { Services } from 'src/utils/constants';
import { CreateRoleDTO } from './DTO/role.dto';
import { AssignPermissionDTO } from './DTO/assign-permission.dto';
import { IRoleService } from './role';

@Controller('role')
export class RoleController {
    constructor(
        @Inject(Services.ROLE) private roleService: IRoleService,
    ) { }

    @Public()
    @Post('create')
    createRole(@Body() body: CreateRoleDTO) {
        return this.roleService.createRole(body);
    }

    @Public()
    @Post('assign-permissions')
    assignPermissions(@Body() body: AssignPermissionDTO) {
        return this.roleService.assignPermissions(body);
    }
}
