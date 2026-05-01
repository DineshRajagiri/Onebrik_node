import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Inject, NotFoundException, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AdminDTO } from './dto/admin.dto';
import { Services } from 'src/utils/constants';
import { IAdminService } from './admin';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { BaseResponse } from 'src/common/DTO/base-response.dto';
import { UploadInterceptor } from 'src/file/upload.interceptor';
import { FileService } from 'src/file/file.service';

@Controller('admin')
export class AdminController {
    constructor(
        @Inject(Services.ADMIN) private adminService: IAdminService,
         private readonly fileService: FileService

    ) { }


    // @Post('createAdmin')
    // @UseInterceptors(
    //     FileInterceptor('adminProfile', {
    //         storage: diskStorage({
    //             destination: './uploads',
    //             filename: (req, file, callback) => {
    //                 const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    //                 const originalName = file.originalname.replace(/\s+/g, '-');
    //                 const fileName = `${uniqueSuffix}-${originalName}`;
    //                 callback(null, fileName);
    //             },
    //         }),
    //     }),
    // )
    // async createEnterprise(
    //     @UploadedFile() file: Express.Multer.File,
    //     @Req() req: Request,
    //     @Body() body: AdminDTO,
    // ) {
    //     const host = req.protocol + '://' + req.get('host');
    //     const fileUrl = `${host}/uploads/${file.filename}`;
    //     return this.adminService.createAdmin(body, fileUrl);
    // }

@UseGuards(JwtAuthGuard)
@Post('profile/upload')
@UseInterceptors(UploadInterceptor('admin'))
async uploadProfile(
  @Req() req,
  @UploadedFile() file: Express.Multer.File,
) {
  if (!file) {
    throw new BadRequestException('File is required');
  }
  const userId = req.user.id;
  const fileUrl = this.fileService.getFileUrl(req, file, 'admin');
  const data = await this.adminService.updateOwnProfile(userId, fileUrl);
  return BaseResponse.ok(data, 'Profile picture updated');
}



}