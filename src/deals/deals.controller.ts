import { BadRequestException, Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Param, Post, Put, Query, Req, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { IDealsService } from './deals';
import { Services } from 'src/utils/constants';
import { AnyFilesInterceptor, FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { dealsDTO } from './DTO/deals.dto';
import { Request } from 'express';
import { Public } from 'src/decorators/public.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
@Controller('deals')
export class DealsController {
    constructor(
        @Inject(Services.DEALS) private dealsService: IDealsService,
    ) { }


    @Post('createDeals')
    @UseInterceptors(
        FileFieldsInterceptor(
            [
                { name: 'dealReport', maxCount: 1 },
                { name: 'enterpriseInvoice', maxCount: 1 },
            ],
            {
                storage: diskStorage({
                    destination: './uploads',
                    filename: (req, file, callback) => {
                        const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
                        callback(null, fileName);
                    },
                }),
                fileFilter: (req, file, callback) => {
                    file.mimetype.match(/(image\/.*|application\/pdf)/)
                        ? callback(null, true)
                        : callback(null, false);
                },
            },
        ),
    )
    async createDeals(
        @UploadedFiles() files: { dealReport?: Express.Multer.File[]; enterpriseInvoice?: Express.Multer.File[] },
        @Req() req: Request,
        @Body() body: dealsDTO,
    ) {
        const host = `${req.protocol}://${req.get('host')}/uploads/`;
        const fileUrls = {
            dealReport: files.dealReport ? host + files.dealReport[0].filename : undefined,
            enterpriseInvoice: files.enterpriseInvoice ? host + files.enterpriseInvoice[0].filename : undefined,
        };

        return this.dealsService.createDeals(body, fileUrls, req);
    }
    @Get('getAllDeals')
    async getAllDeals(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('dealStatus') dealStatus?: string,
        @Query('dealType') dealType?: string
    ) {
        try {
            const pageNumber = Number(page);
            const limitNumber = Number(limit);

            return await this.dealsService.getAllDeals(
                !isNaN(pageNumber) && pageNumber > 0 ? pageNumber : 1,
                !isNaN(limitNumber) && limitNumber > 0 ? limitNumber : 10,
                dealStatus || '',
                dealType || ''
            );
        } catch (error) {
            console.error('Error in getAllDeals controller:', error);

            throw new HttpException(
                { success: false, message: error.message || 'Failed to fetch deals' },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
    @Put('updateDeals/:id')
    @UseInterceptors(
        AnyFilesInterceptor({
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
    async updateDeals(
        @Param('id') id: string,
        @Body() updateData: dealsDTO,
        @Req() req: Request,
        @UploadedFiles() files?: Express.Multer.File[]
    ) {
        const host = req.protocol + '://' + req.get('host');
        let fileUrls = {
            dealReport: null,
            enterpriseInvoice: null,
        };

        if (files) {
            files.forEach((file) => {
                if (file.fieldname === 'dealReport') {
                    fileUrls.dealReport = `${host}/uploads/${file.filename}`;
                }
                if (file.fieldname === 'enterpriseInvoice') {
                    fileUrls.enterpriseInvoice = `${host}/uploads/${file.filename}`;
                }
            });
        }

        return this.dealsService.updateDeals(id, updateData, fileUrls);
    }
    @Post('updateDealStatus')
    async updateDealStatus(@Body() body: any) {
        return await this.dealsService.updateDealStatus(body);
    }


    @Get('getDealsById/:id')
    async getDealsById(@Param('id') id: string) {
        try {
            return await this.dealsService.getDealsById(id);
        } catch (error) {
            throw new HttpException(
                { success: false, message: error.message || 'Failed to fetch deal details' },
                HttpStatus.BAD_REQUEST
            );
        }
    }

    @Delete('deleteDeals/:id')
    async deleteEnterprise(@Param('id') id: string) {
        try {
            return await this.dealsService.deleteDeals(id);
        } catch (error) {
            throw new HttpException(
                { success: false, message: error.message || 'Failed to delete deal' },
                HttpStatus.BAD_REQUEST
            );
        }
    }

    @Get('dashboardStats')
    async getDealStats() {
        return this.dealsService.getDealStatus();
    }






    @Post('dealCalculation')
    async dealCalculation(
        @Body() body: { dealId: string; investmentAmount: number }
    ) {
        try {
            const { dealId, investmentAmount } = body;
            const result = await this.dealsService.dealCalculation(dealId, investmentAmount);

            return {
                success: true,
                statusCode: HttpStatus.OK,
                message: 'Deal calculation successful',
                result: result.result,
            };
        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: error.message || 'An error occurred during deal calculation',
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Post('dealPurchase')
    async createDealPurchase(@Body() data: any, @Req() req: any) {
        return this.dealsService.createDealPurchase(data, req);
    }



    @Get('getDealPurchase/:userId')
async getDealPurchaseByUserId(@Param('userId') userId: string) {
  return this.dealsService.getDealPurchaseByUserId(userId);
}
@Get('getAllDealPurchases')
async getAllDealPurchases(
  @Query('page') page: string, 
  @Query('limit') limit: string, 
  @Query('dealStatus') dealStatus: string, 
  @Query('dealType') dealType: string
) {
  const pageNumber = parseInt(page, 10) || 1;
  const limitNumber = parseInt(limit, 10) || 10;

  return this.dealsService.getAllDealPurchases(
    pageNumber, 
    limitNumber, 
    dealStatus, 
    dealType
  );
}






}