import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserProfile, UserProfileDocument } from 'src/schema/userProfile.schema';
import { CreateProfileDTO } from './DTO/create-profile.dto';
import { Model } from 'mongoose';

@Injectable()
export class UserProfileService {
    constructor(
        @InjectModel(UserProfile.name) private readonly userProfileModel: Model<UserProfileDocument>
        //   @InjectModel(UserProfile.name) private readonly modules: Model<modulesDetails>,
    ) { }

    // CREATE OR UPDATE PROFILE
    async setProfile(dto: CreateProfileDTO) {
        const existing = await this.userProfileModel.findOne({
            userId: dto.userId,
        });

        if (existing) {
            existing.profileData = dto.profileData;
            existing.roleId = dto.roleId;
            await existing.save();

            return {
                success: true,
                statusCode: 200,
                message: "Profile updated successfully",
                profile: existing,
            };
        }

        const created = await this.userProfileModel.create(dto);

        return {
            success: true,
            statusCode: 201,
            message: "Profile created successfully",
            profile: created,
        };
    }

    // GET PROFILE BY USER ID
    async getProfile(userId: string) {
        const profile = await this.userProfileModel.findOne({ userId });

        if (!profile) {
            throw new HttpException("Profile not found", HttpStatus.NOT_FOUND);
        }

        return {
            success: true,
            statusCode: 200,
            profile,
        };
    }
}
