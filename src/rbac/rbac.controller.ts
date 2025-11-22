import { Body, Controller, Inject, Post } from '@nestjs/common';
import { Services } from 'src/utils/constants';
import { IRBACService } from './rbac';
import { moduleDTO } from './DTO/module.dto';
import { Public } from 'src/decorators/public.decorator';
import { subModuleDTO } from './DTO/submodule.dto';
import { subModuleChildDTO } from './DTO/subModuleChild.dto';

@Controller('rbac')
export class RbacController {
    constructor(
        @Inject(Services.RBAC) private rbacService: IRBACService,
    ) { }

    @Public()
    @Post('createModule')
    async createModule(@Body() body: moduleDTO) {
        return await this.rbacService.createModule(body)
    }

    @Public()
    @Post("subModule")
    async createSubModule(@Body() body: subModuleDTO) {
        return this.rbacService.createSubModule(body);
    }

    @Public()
    @Post("subModuleChild")
    async createSubModuleChild(@Body() body: subModuleChildDTO) {
        return this.rbacService.createSubModuleChild(body);
    }

}
