import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Put, Query } from '@nestjs/common';
// import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { IUserService } from './users';
import { Services } from 'src/utils/constants';
import { Public } from 'src/decorators/public.decorator';
import { UpdateUserDto } from './DTO/update-user.dto';
import { BaseResponse } from 'src/common/DTO/base-response.dto';

@Controller('user')
export class UsersController {
  constructor(
    @Inject(Services.USERS) private service: IUserService,
  ) { }

@Public()
 @Post()
  async create(@Body() dto: CreateUserDto) {
    const user = await this.service.create(dto);
    return BaseResponse.ok(user, 'User created successfully');
  }

  @Get()
  async findAll() {
    const users = await this.service.findAll();
    return BaseResponse.ok(users);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.service.findOne(id);
    return BaseResponse.ok(user);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.service.update(id, dto);
    return BaseResponse.ok(user, 'User updated successfully');
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return BaseResponse.ok(null, 'User deleted successfully');
  }

}