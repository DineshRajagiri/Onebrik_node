import { Body, Controller, Inject, Get, Post, Req, UploadedFiles, UseInterceptors, UploadedFile, Query, HttpException, HttpStatus, Patch, Param, UseGuards } from '@nestjs/common';
import { Services } from 'src/utils/constants';
import { INeftService } from './neft';
import { neftDTO } from './dto/neft.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
@Controller('neft')
export class NeftController {
    constructor(
        @Inject(Services.NEFT) private neftService: INeftService,
    ) { }

    @Post('createNeft')
    @UseGuards(AuthGuard('jwt')) 
    @UseInterceptors(
        FileInterceptor('uploadImage', {
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
    async createNeft(
        @UploadedFile() file: Express.Multer.File,
        @Req() req: any,
        @Body() body: neftDTO,
    ) {
        const host = req.protocol + '://' + req.get('host');
        const fileUrl = `${host}/uploads/${file.filename}`;
    
        return this.neftService.createNeft(body, fileUrl, req);
    }
    @Get('getNeftByUser/:userId')
    async getNeftByUser(
        @Param('userId') userId: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string,
        @Query('status') status?: string
    ) {
        try {
            return await this.neftService.getNeftTransactionsByUserId(
                userId,
                Number(page) || 1,
                Number(limit) || 10,
                search || '',
                status || ''
            );
        } catch (error) {
            throw new HttpException(
                { success: false, message: error.message || 'Failed to fetch user NEFT transactions' },
                HttpStatus.BAD_REQUEST
            );
        }
    }
    
    
    @Get('neftCountAPI')
    async getNeftStatus() {
        return this.neftService.getNeftStatus();
    }
    @Patch('update-status/:id')
    async updateNeftStatus(@Param('id') id: string, @Body() body: any) {
      return this.neftService.updateNeftStatus(id, body);
    }
    @Post('UpdateNeft/:id')
    @UseInterceptors(
      FileInterceptor('uploadImage', {
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
    async UpdateNeft(
      @Param('id') id: string,
      @Body() body: any,
      @UploadedFile() file: Express.Multer.File,
      @Req() req: any,
    ) {
      try {
        const result = await this.neftService.UpdateNeft(id, body, file?.filename, req);
        return result;
      } catch (error) {
        return {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message || 'An error occurred while updating NEFT',
        };
      }
    } 
    @Get('getAllNeft')
    async getAllNeft(@Query('page') page?: number, @Query('limit') limit?: number, @Query('search') search?: string, @Query('status') status?: string) {
        try {
            return await this.neftService.getAllNeft(
                Number(page) || 1,
                Number(limit) || 10,
                search || '',
                status || ''
            );
        } catch (error) {
            throw new HttpException(
                { success: false, message: error.message || 'Failed to fetch Neft Transactions' },
                HttpStatus.BAD_REQUEST
            );
        }
    }
    
}
