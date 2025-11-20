import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { Services } from 'src/utils/constants';
import { IMasterService } from './masters';
import { relationshipDTO } from './DTO/realtionship.dto';
import { experienceDTO } from './DTO/experience.dto';
import { incomeRangeDTO } from './DTO/incomeRange.dto';
import { professionDTO } from './DTO/profession.dto';
import { xScoreDTO } from './DTO/xScore.dto';
import { relationshipManagerDTO } from './DTO/realationshipManager.dto';
import { roleDTO } from './DTO/role.dto';
import { categoryDTO } from './DTO/category.dto';
import { regionDTO } from './DTO/region.dto';

@Controller('masters')
export class MastersController {
    constructor(
        @Inject(Services.MASTERS) private masterService: IMasterService,
    ) { }

    //One brik//

    @Post('createCategory')
    async createCategory(@Body() body: categoryDTO) {
        return await this.masterService.createCategory(body)
    }

    @Get('getAllCategoryList')
    async getAllCategory(@Query('page') page: number, @Query('limit') limit: number, @Query('search') search: string,) {
        return this.masterService.getAllCategory(Number(page) || 1, Number(limit) || 10, search || '');
    }

    @Put('updateCategory/:id')
    async updateCategory(@Param('id') id: string, @Body() body: categoryDTO) {
        return await this.masterService.updateCategory(id, body);
    }

    @Delete('deleteCategory/:id')
    async deleteCategory(@Param('id') id: string) {
        return await this.masterService.deleteCategory(id);
    }


    @Post('createRegion')
    async createRegion(@Body() body: regionDTO) {
        return await this.masterService.createRegion(body)
    }

    @Get('getAllRegionList')
    async getAllRegion(@Query('page') page: number, @Query('limit') limit: number, @Query('search') search: string,) {
        return this.masterService.getAllRegion(Number(page) || 1, Number(limit) || 10, search || ''
        );
    }

    @Put('updateRegion/:id')
    async updateRegion(@Param('id') id: string, @Body() body: regionDTO) {
        return await this.masterService.updateRegion(id, body);
    }
    @Delete('deleteRegion/:id')
    async deleteRegion(@Param('id') id: string) {
        return await this.masterService.deleteRegion(id);
    }




    //invoice traders//

    //RelationShip//
    @Get('getAllRealtionshipList')
    async getAllRelationship(@Query('page') page?: string, @Query('limit') limit?: string, @Query('search') Search?: string) {
        const pageNumber = page ? parseInt(page, 10) : 1;
        const pageSize = limit ? parseInt(limit, 10) : 10;
        return this.masterService.getAllRelationship(pageNumber, pageSize, Search);
    }

    @Put('updateRelationship/:id')
    async updateRelationship(@Param('id') id: string, @Body() body: relationshipDTO) {
        return await this.masterService.updateRelationship(id, body);
    }

    // @Get('getRelationshipById/:id')
    // async getModuleById(@Param('id') id: string) {
    //     return this.sidebarService.getModuleById(id);
    // }

    @Delete('deleteRelationship/:id')
    async deleteRelationship(@Param('id') id: string) {
        return await this.masterService.deleteRelationship(id);
    }
    @Post('createRelationship')
    async createRelationship(@Body() body: relationshipDTO) {
        return await this.masterService.createRelationship(body)
    }
    @Get('getRelationshipById/:id')
    async getRelationshipById(@Param('id') id: string) {
        return this.masterService.getRelationshipById(id);
    }
    //experience//
    @Get('getAllExperienceList')
    async getAllExperience(@Query('page') page?: string, @Query('limit') limit?: string, @Query('search') Search?: string) {
        const pageNumber = page ? parseInt(page, 10) : 1;
        const pageSize = limit ? parseInt(limit, 10) : 10;
        return this.masterService.getAllExperience(pageNumber, pageSize, Search);
    }

    @Put('updateExperience/:id')
    async updateExperience(@Param('id') id: string, @Body() body: experienceDTO) {
        return await this.masterService.updateExperience(id, body);
    }

    // @Get('getRelationshipById/:id')
    // async getModuleById(@Param('id') id: string) {
    //     return this.sidebarService.getModuleById(id);
    // }

    @Delete('deleteExperience/:id')
    async deleteExperience(@Param('id') id: string) {
        return await this.masterService.deleteExperience(id);
    }
    @Post('createExperience')
    async createExperience(@Body() body: experienceDTO) {
        return await this.masterService.createExperience(body)
    }
    @Get('getExperienceById/:id')
    async getExperienceById(@Param('id') id: string) {
        return this.masterService.getExperienceById(id);
    }
    //incomeRange//
    @Get('getAllIncomeRangeList')
    async getAllIncomeRange(@Query('page') page?: string, @Query('limit') limit?: string, @Query('search') Search?: string) {
        const pageNumber = page ? parseInt(page, 10) : 1;
        const pageSize = limit ? parseInt(limit, 10) : 10;
        return this.masterService.getAllIncomeRange(pageNumber, pageSize, Search);
    }

    @Put('updateIncomeRange/:id')
    async updateIncomeRange(@Param('id') id: string, @Body() body: incomeRangeDTO) {
        return await this.masterService.updateIncomeRange(id, body);
    }

    // @Get('getRelationshipById/:id')
    // async getModuleById(@Param('id') id: string) {
    //     return this.sidebarService.getModuleById(id);
    // }

    @Delete('deleteIncomeRange/:id')
    async deleteIncomeRange(@Param('id') id: string) {
        return await this.masterService.deleteIncomeRange(id);
    }
    @Post('createIncomeRange')
    async createIncomeRange(@Body() body: incomeRangeDTO) {
        return await this.masterService.createIncomeRange(body)
    }
    @Get('getIncomeRangeById/:id')
    async getIncomeRangeById(@Param('id') id: string) {
        return this.masterService.getIncomeRangeById(id);
    }

    //profession//
    @Get('getAllProfessionList')
    async getAllProfession(@Query('page') page?: string, @Query('limit') limit?: string, @Query('search') Search?: string) {
        const pageNumber = page ? parseInt(page, 10) : 1;
        const pageSize = limit ? parseInt(limit, 10) : 10;
        return this.masterService.getAllProfession(pageNumber, pageSize, Search);
    }

    @Put('updateProfession/:id')
    async updateProfession(@Param('id') id: string, @Body() body: professionDTO) {
        return await this.masterService.updateProfession(id, body);
    }

    // @Get('getRelationshipById/:id')
    // async getModuleById(@Param('id') id: string) {
    //     return this.sidebarService.getModuleById(id);
    // }

    @Delete('deleteProfession/:id')
    async deleteProfession(@Param('id') id: string) {
        return await this.masterService.deleteProfession(id);
    }
    @Post('createProfession')
    async createProfession(@Body() body: professionDTO) {
        return await this.masterService.createProfession(body)
    }
    @Get('getProfessionById/:id')
    async getProfessionById(@Param('id') id: string) {
        return this.masterService.getProfessionById(id);
    }

    //xScore
    @Get('getAllxScoreList')
    async getAllxScore(@Query('page') page?: string, @Query('limit') limit?: string, @Query('search') Search?: string) {
        const pageNumber = page ? parseInt(page, 10) : 1;
        const pageSize = limit ? parseInt(limit, 10) : 10;
        return this.masterService.getAllxScore(pageNumber, pageSize, Search);
    }

    @Put('updatexScore/:id')
    async updatexScore(@Param('id') id: string, @Body() body: xScoreDTO) {
        return await this.masterService.updatexScore(id, body);
    }
    @Delete('deletexScore/:id')
    async deletexScore(@Param('id') id: string) {
        return await this.masterService.deletexScore(id);
    }
    @Post('createxScore')
    async createxScore(@Body() body: xScoreDTO) {
        return await this.masterService.createxScore(body)
    }
    @Get('getxScoreById/:id')
    async getxScoreById(@Param('id') id: string) {
        return this.masterService.getxScoreById(id);
    }
    @Get('xScoreList')
    async getExScoreList() {
        return this.masterService.xScoreList();
    }

    //Relationshipmanager
    @Post('createRelationshipManager')
    async createRelationshipManager(@Body() body: relationshipManagerDTO) {
        return await this.masterService.createRelationshipManager(body)
    }
    @Get('getAllRelationshipManagerList')
    async getAllRelationshipManager(@Query('page') page?: string, @Query('limit') limit?: string, @Query('search') Search?: string) {
        const pageNumber = page ? parseInt(page, 10) : 1;
        const pageSize = limit ? parseInt(limit, 10) : 10;
        return this.masterService.getAllRelationshipManager(pageNumber, pageSize, Search);
    }
    @Put('updateRelationshipManager/:id')
    async updateRelationshipManager(@Param('id') id: string, @Body() body: relationshipManagerDTO) {
        return await this.masterService.updateRelationshipManager(id, body);
    }

    @Delete('deleteRelationshipManager/:id')
    async deleteRelationshipManager(@Param('id') id: string) {
        return await this.masterService.deleteRelationshipManager(id);
    }

    //role
    @Post('createRole')
    async createRole(@Body() body: roleDTO) {
        return await this.masterService.createRole(body)
    }

    @Get('getAllRoles')
    async getAllRoles(@Query('page') page?: string, @Query('limit') limit?: string, @Query('search') Search?: string) {
        const pageNumber = page ? parseInt(page, 10) : 1;
        const pageSize = limit ? parseInt(limit, 10) : 10;
        return this.masterService.getAllRoles(pageNumber, pageSize, Search);
    }
    @Put('updateRole/:id')
    async updateRole(@Param('id') id: string, @Body() body: roleDTO) {
        return await this.masterService.updateRole(id, body);
    }

    @Delete('deleteRole/:id')
    async deleteRole(@Param('id') id: string) {
        return await this.masterService.deleteRole(id);
    }
    @Get('getRoleById/:id')
    async getRoleById(@Param('id') id: string) {
        return this.masterService.getRoleById(id);
    }
}
