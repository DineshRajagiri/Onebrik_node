import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Param, Post, Put, Query, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Services } from 'src/utils/constants';
import { IVendorService } from './vendor';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { vendorDTO } from './DTO/vendor.dto';
import { Request } from 'express';
@Controller('vendor')
export class VendorController {
    constructor(
        @Inject(Services.VENDOR) private vendorService: IVendorService,
    ) { }

    @Post('createVendor')
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
    async createVendor(
        @UploadedFile() file: Express.Multer.File,
        @Req() req: Request,
        @Body() body: vendorDTO,
    ) {
        const host = req.protocol + '://' + req.get('host');
        const fileUrl = `${host}/uploads/${file.filename}`;
        return this.vendorService.createVendor(body, fileUrl);
    }

    @Put('updateVendor/:id')
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
    async updateVendor(
        @Param('id') id: string,
        @Body() updateData: vendorDTO,
        @UploadedFile() file?: Express.Multer.File
    ) {
        return this.vendorService.updateVendor(id, updateData, file);
    }


    @Get('getAllVendor')
    async getAllVendor(@Query('page') page?: number, @Query('limit') limit?: number, @Query('search') search?: string, @Query('status') status?: string) {
        try {
            return await this.vendorService.getAllVendor(
                Number(page) || 1,
                Number(limit) || 10,
                search || '',
                status || ''
            );
        } catch (error) {
            throw new HttpException(
                { success: false, message: error.message || 'Failed to fetch enterprises' },
                HttpStatus.BAD_REQUEST
            );
        }
    }

    @Get('getVendorById/:id')
    async getVendorById(@Param('id') id: string) {
        try {
            return await this.vendorService.getVendorById(id);
        } catch (error) {
            throw new HttpException(
                { success: false, message: error.message || 'Failed to fetch enterprise details' },
                HttpStatus.BAD_REQUEST
            );
        }
    }

    @Delete('deleteVendor/:id')
    async deleteVendor(@Param('id') id: string) {
        try {
            return await this.vendorService.deleteVendor(id);
        } catch (error) {
            throw new HttpException(
                { success: false, message: error.message || 'Failed to delete Vendor' },
                HttpStatus.BAD_REQUEST
            );
        }
    }

    @Post('updateStatus')
    async updateVendorStatus(@Body() body: any) {
        return await this.vendorService.updateVendorStatus(body);
    }

    @Get('vendorList')
    async getVendorList() {
        return this.vendorService.vendorList();
    }
    @Get('dashboardStatus')
    async getvendorStatus() {
        return this.vendorService.getvendorStatus();
    }
}
