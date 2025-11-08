import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Inject, NotFoundException, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AdminDTO } from './dto/admin.dto';
import { Services } from 'src/utils/constants';
import { IAdminService } from './admin';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponse } from '@nestjs/swagger';

@Controller('admin')
export class AdminController {
    constructor(
        @Inject(Services.ADMIN) private adminService: IAdminService,
  
    ) { }


    @Post('createAdmin')
    @UseInterceptors(
        FileInterceptor('adminProfile', {
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
        @Body() body: AdminDTO,
    ) {
        const host = req.protocol + '://' + req.get('host');
        const fileUrl = `${host}/uploads/${file.filename}`;
        return this.adminService.createAdmin(body, fileUrl);
    }

    @Get('getAllAdmin')
    async getAllAdmin(@Query('page') page?: number, @Query('limit') limit?: number, @Query('search') search?: string, @Query('status') status?: string) {
        try {
            return await this.adminService.getAllAdmin(
                Number(page) || 1,
                Number(limit) || 10,
                search || '',
                status || ''
            );
        } catch (error) {
            throw new HttpException(
                { success: false, message: error.message || 'Failed to fetch admins' },
                HttpStatus.BAD_REQUEST
            );
        }
    }
    @Put(' updateAdmin/:id')
    @UseInterceptors(
        FileInterceptor('adminProfile', {
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
    async updateAdmin(@Param('id') id: string, @Body() updateData: AdminDTO, @Req() req: Request, @UploadedFile() file?: Express.Multer.File) {
        let fileUrl = null;
        if (file) {
            const host = req.protocol + '://' + req.get('host');
            fileUrl = `${host}/uploads/${file.filename}`;
        }
        return this.adminService.updateAdmin(id, updateData, fileUrl);
    }
    @Delete('deleteAdmin/:id')
    async deleteAdmin(@Param('id') id: string) {
        return await this.adminService.deleteAdmin(id);
    }
    @Post('updateAdminStatus')
    async updateAdminStatus(@Body() body: any) {
        return await this.adminService.updateAdminStatus(body);
    }
    @Get('getAdminById/:id')
    async getAdminById(@Param('id') id: string) {
        return this.adminService.getAdminById(id);
    }

    @Put('updateAdminProfile/:id')
    @UseInterceptors(
        FileInterceptor('adminProfile', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, callback) => {
                    if (!file) {
                        return callback(new Error('No file provided'), '');
                    }
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const originalName = file.originalname.replace(/\s+/g, '-');
                    const fileName = `${uniqueSuffix}-${originalName}`;
                    callback(null, fileName);
                },
            }),
            limits: { fileSize: 5 * 1024 * 1024 },
        }),
    )
    async updateAdminProfile(
        @Param('id') id: string,
        @Req() req: Request,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        if (!file) {
            throw new Error('File upload failed. File is undefined.');
        }

        const host = `${req.protocol}://${req.get('host')}`;
        const fileUrl = `${host}/uploads/${file.filename}`;

        return this.adminService.updateAdminProfile(id, fileUrl);
    }
    @Put('change-password/:id')
    @HttpCode(HttpStatus.OK)
    async changePassword(
        @Param('id') adminId: string,
        @Body() changePasswordDTO: { oldPassword: string, newPassword: string, confirmPassword: string },  // Extract confirmPassword from the body
    ) {
        const { oldPassword, newPassword, confirmPassword } = changePasswordDTO;
        return await this.adminService.changePassword(adminId, oldPassword, newPassword, confirmPassword);  // Pass all three parameters
    }
    @Get('adminProfile/:id')
async getAdminProfileById(@Param('id') id: string) {
  const result = await this.adminService.getAdminProfileById(id);

  if (!result) {
    throw new NotFoundException('Admin not found');
  }

  return {
    success: true,
    adminProfile: result.adminProfile,
  };
}

    
}