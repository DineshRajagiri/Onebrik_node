import { Body, Controller,Inject, Post } from '@nestjs/common';
import { Services } from 'src/utils/constants';
import { IUsersService } from './users';
import { Public } from 'src/decorators/public.decorator';
import { SaveUserDto } from './DTO/create-user.dto';
import { AssignRoleDto } from './DTO/assign-role.dto';

@Controller('user')
export class UsersController {
  constructor(
    @Inject(Services.USERS) private userService: IUsersService,
  ) { }

@Public()
@Post('save')
saveUser(@Body() dto: SaveUserDto) {
  return this.userService.save(dto);
}


}