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
        const fileUrl = file ? `${host}/uploads/${file.filename}` : null;

        return this.vendorService.createVendor(body, fileUrl);
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
    @Get('getAllVendor')
    async getAllVendor(
        @Query('page') page: number,
        @Query('limit') limit: number,
        @Query('search') search: string,
    ) {
        return this.vendorService.getAllVendor(
            Number(page) || 1,
            Number(limit) || 10,
            search || ''
        );
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
        @UploadedFile() file: Express.Multer.File,
        @Body() body: vendorDTO,
        @Req() req: Request,
    ) {
        let fileUrl: string | undefined = undefined;

        if (file) {
            const host = req.protocol + '://' + req.get('host');
            fileUrl = `${host}/uploads/${file.filename}`;
        }

        return this.vendorService.updateVendor(id, body, fileUrl);
    }

    @Delete('deleteVendor:id')
    async deleteVendor(@Param('id') id: string) {
        const response = await this.vendorService.deleteVendor(id);

        return {
            success: response.success,
            message: response.message,
            statusCode: response.statusCode
        };
    }
    

}
