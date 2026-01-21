import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { Services } from 'src/utils/constants';
import { IMasterService } from './masters';
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

}
