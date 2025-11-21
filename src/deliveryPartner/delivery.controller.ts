import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Param, Post, Put, Query, Req, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { Services } from 'src/utils/constants';
import { diskStorage } from 'multer';
import { Request } from 'express';
import { IDeliveryBoyService } from './delivery';
import { deliveryBoyDTO } from './dto/deliveryBoy.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('delivery')
export class DeliveryController {
    constructor(
        @Inject(Services.DELIVERYBOY) private DeliveryBoyService: IDeliveryBoyService,
    ) { }

    @Post('createDeliveryBoy')
    @UseInterceptors(
        FileFieldsInterceptor(
            [
                { name: 'physicalDocuments', maxCount: 2 },
                { name: 'profilePicture', maxCount: 1 }
            ],
            {
                storage: diskStorage({
                    destination: './uploads',
                    filename: (req, file, callback) => {
                        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                        const originalName = file.originalname.replace(/\s+/g, '-');
                        callback(null, `${uniqueSuffix}-${originalName}`);
                    },
                }),
            },
        )
    )
    async createDeliveryBoy(
        @UploadedFiles() files: { physicalDocuments?: Express.Multer.File[]; profilePicture?: Express.Multer.File[] },
        @Req() req: Request,
        @Body() body: deliveryBoyDTO,
    ) {
        const host = req.protocol + '://' + req.get('host');

        const physicalDocumentsUrl = files?.physicalDocuments
            ? `${host}/uploads/${files.physicalDocuments[0].filename}`
            : null;

        const profilePictureUrl = files?.profilePicture
            ? `${host}/uploads/${files.profilePicture[0].filename}`
            : null;

        return this.DeliveryBoyService.createDeliveryBoy(body, physicalDocumentsUrl, profilePictureUrl);
    }




    @Get('getDeliveryBoyId/:id')
    async getDeliveryBoyId(@Param('id') id: string) {
        try {
            return await this.DeliveryBoyService.getDeliveryBoyId(id);
        } catch (error) {
            throw new HttpException(
                { success: false, message: error.message || 'Failed to fetch DeliveryBoy details' },
                HttpStatus.BAD_REQUEST
            );
        }
    }


    @Get('getAllDeliveryBoys')
    async getAllDeliveryBoy(
        @Query('page') page: number,
        @Query('limit') limit: number,
        @Query('search') search: string,
    ) {
        return this.DeliveryBoyService.getAllDeliveryBoys(
            Number(page) || 1,
            Number(limit) || 10,
            search || ''
        );
    }



    @Put('updateDeliveryBoy/:id')
    @UseInterceptors(
        FileFieldsInterceptor(
            [
                { name: 'physicalDocuments', maxCount: 1 },
                { name: 'profilePicture', maxCount: 1 },
            ],
            {
                storage: diskStorage({
                    destination: './uploads',
                    filename: (req, file, callback) => {
                        const uniqueSuffix =
                            Date.now() + '-' + Math.round(Math.random() * 1e9);
                        const originalName = file.originalname.replace(/\s+/g, '-');
                        callback(null, `${uniqueSuffix}-${originalName}`);
                    },
                }),
            },
        ),
    )


    async updateDeliveryBoy(@Param('id') id: string, @UploadedFiles()
    files: {
        physicalDocuments?: Express.Multer.File[];
        profilePicture?: Express.Multer.File[];
    },
        @Req() req: Request,
        @Body() body: deliveryBoyDTO,
    ) {
        const host = req.protocol + '://' + req.get('host');

        const physicalDocumentsUrl = files?.physicalDocuments
            ? `${host}/uploads/${files.physicalDocuments[0].filename}`
            : undefined;

        const profilePictureUrl = files?.profilePicture
            ? `${host}/uploads/${files.profilePicture[0].filename}`
            : undefined;

        return this.DeliveryBoyService.updateDeliveryBoy(
            id,
            body,
            physicalDocumentsUrl,
            profilePictureUrl,
        );
    }

    @Delete('deleteDeliverBoy/:id')
    async deleteDeliverBoy(@Param('id') id: string) {
        const response = await this.DeliveryBoyService.deleteDeliveryBoy(id);

        return {
            success: response.success,
            message: response.message,
            statusCode: response.statusCode
        };
    }
}
