import { Body, Controller, Inject, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Services } from 'src/utils/constants';
import { IblogsService } from './blogs';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { blogsDTO } from './dto/blogs.dto';
import { Request } from 'express';
@Controller('blogs')
export class BlogsController {
    constructor(
        @Inject(Services.BLOGS) private BlogsService : IblogsService,
    ) { }


    
        @Post('createblogs')
        @UseInterceptors(
            FileInterceptor('image', {
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
        async createblogs(
            @UploadedFile() file: Express.Multer.File,
            @Req() req: Request,
            @Body() body: blogsDTO,
        ) {
            const host = req.protocol + '://' + req.get('host');
            const fileUrl = `${host}/uploads/${file.filename}`;
            return this.BlogsService.createblogs(body, fileUrl);
        }
}
