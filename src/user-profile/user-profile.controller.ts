import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { CreateProfileDTO } from './DTO/create-profile.dto';
import { Public } from 'src/decorators/public.decorator';
import { IUserProfileService } from './user-profile';
import { Services } from 'src/utils/constants';

@Controller('user-profile')
export class UserProfileController {


    constructor(
        @Inject(Services.USERPROFILE) private userProfileService: IUserProfileService,
    ) { }

    @Public()
    @Post('set')
    setProfile(@Body() dto: CreateProfileDTO) {
        return this.userProfileService.setProfile(dto);
    }

    @Public()
    @Get(':userId')
    getProfile(@Param('userId') userId: string) {
        return this.userProfileService.getProfile(userId);
    }
}
