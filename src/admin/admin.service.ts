import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { admin, adminDetails } from 'src/schema/admin.schema';
import { AdminDTO } from './dto/admin.dto';
import * as bcrypt from 'bcrypt';
import { isAdminStatus } from 'src/utils/constants';

@Injectable()
export class AdminService {
    constructor(
        @InjectModel(admin.name) private readonly adminModel: Model<adminDetails>,) {
    }

    async updateOwnProfile(userId: string, fileUrl: string) {

        const admin = await this.adminModel.findOne({ userId });
        if (!admin) {
            throw new NotFoundException('Admin profile not found');
        }

        admin.adminProfile = fileUrl;
        await admin.save();

        return {
            adminProfile: admin.adminProfile
        };
    }










}