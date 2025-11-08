import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { blogsDTO } from './dto/blogs.dto';
import { InjectModel } from '@nestjs/mongoose';
import { blogs, BlogsDocument} from 'src/schema/blogs.schema';
import { Model } from 'mongoose';

@Injectable()
export class BlogsService {
      constructor(
            @InjectModel(blogs.name) private readonly blogs: Model<BlogsDocument>,
        ) { }
    async createblogs(data: blogsDTO, file?: any) {
        try {
            if (!file) {
                throw new HttpException(
                    {
                        success: false,
                        statusCode: HttpStatus.BAD_REQUEST,
                        message: 'No file uploaded',
                    },
                    HttpStatus.BAD_REQUEST,
                );
            }

            const existingBlogs = await this.blogs.findOne({ blogHeading: data.blogHeading });

            if (existingBlogs) {
                return {
                    success: false,
                    statusCode: HttpStatus.CONFLICT,
                    message: 'Blogs already exists',
                };
            }

            
            data.image = file;


            const savedBlogs = await this.blogs.create(data);

            if (!savedBlogs) {
                throw new HttpException(
                    { success: false, message: 'Unable to create blogs' },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }

            return {
                success: true,
                statusCode: HttpStatus.CREATED,
                message: 'Blogs created successfully',
                blogs: savedBlogs,
            };
        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: error.message || 'An error occurred',
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }
}
