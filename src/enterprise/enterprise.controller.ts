import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Param, Post, Put, Query, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { enterpriseDTO } from './DTO/enterprise.dto';
import { IEnterpriseService } from './enterprise';
import { isEnterpriseStatus, Services } from 'src/utils/constants';
import { diskStorage } from 'multer';
import { Public } from 'src/decorators/public.decorator';
import { Request } from 'express';
@Controller('enterprise')
export class EnterpriseController {
    constructor(
        @Inject(Services.ENTERPRISE) private enterpriseService: IEnterpriseService,
    ) { }

    @Post('createEnterprise')
    @UseInterceptors(
        FileInterceptor('uploadLogo', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, callback) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const originalName = file.originalname.replace(/\s+/g, '-');
                    const fileName = `${uniqueSuffix}-${originalName}`;
                    callback(null, fileName);
                },
            }),
        }),
    )
    async createEnterprise(
        @UploadedFile() file: Express.Multer.File,
        @Req() req: Request,
        @Body() body: enterpriseDTO,
    ) {
        const host = req.protocol + '://' + req.get('host');
        const fileUrl = `${host}/uploads/${file.filename}`;
        return this.enterpriseService.createEnterprise(body, fileUrl);
    }

    @Put('updateEnterprise/:id')
    @UseInterceptors(
        FileInterceptor('uploadLogo', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, callback) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const originalName = file.originalname.replace(/\s+/g, '-');
                    const fileName = `${uniqueSuffix}-${originalName}`;
                    callback(null, fileName);
                },
            }),
        }),
    )
    async updateEnterprise(
        @Param('id') id: string,
        @Body() updateData: enterpriseDTO,
        @Req() req: Request,
        @UploadedFile() file?: Express.Multer.File
    ) {
        let fileUrl = null;

        if (file) {
            const host = req.protocol + '://' + req.get('host');
            fileUrl = `${host}/uploads/${file.filename}`;
        }

        return this.enterpriseService.updateEnterprise(id, updateData, fileUrl);
    }


    @Get('getAllEnterprise')
    async getAllEnterprise(@Query('page') page?: number, @Query('limit') limit?: number, @Query('search') search?: string, @Query('status') status?: string) {
        try {
            return await this.enterpriseService.getAllEnterprise(
                Number(page) || 1,
                Number(limit) || 10,
                search || '',
                status || ''
            );
        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    message: error.message || 'Failed to fetch enterprises',
                },
                HttpStatus.BAD_REQUEST
            );
        }
    }


    @Delete('deleteEnterprise/:id')
    async deleteEnterprise(@Param('id') id: string) {
        try {
            return await this.enterpriseService.deleteEnterprise(id);
        } catch (error) {
            throw new HttpException(
                { success: false, message: error.message || 'Failed to delete enterprise' },
                HttpStatus.BAD_REQUEST
            );
        }
    }


    @Post('updateStatus')
    async updateEnterpriseStatus(@Body() body: any) {
        return await this.enterpriseService.updateEnterpriseStatus(body);
    }


    @Get('getEnterpriseById/:id')
    async getEnterpriseById(@Param('id') id: string) {
        try {
            return await this.enterpriseService.getEnterpriseById(id);
        } catch (error) {
            throw new HttpException(
                { success: false, message: error.message || 'Failed to fetch enterprise details' },
                HttpStatus.BAD_REQUEST
            );
        }
    }

    @Get('dashboardStats')
    async getEnterpriseStatistics() {
        return this.enterpriseService.getEnterpriseStats();
    }
    @Get('enterpriseList')
    async getEnterpriseList() {
        return this.enterpriseService.enterpriseList();
    }

}