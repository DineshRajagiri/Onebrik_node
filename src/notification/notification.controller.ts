import { Body, Controller, Delete, Get, Inject, Param, Patch, Post } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { notification_token_Dto } from './dto/createnotificationtoken.dto';
import { Services } from 'src/utils/constants';
import { INotificationService } from './notification';
import { Public } from 'src/decorators/public.decorator';
// import { firebase } from './config/firebase-init';
import { admin } from './config/firebase-init'; 
// import * as firebase from 'firebase-admin';
// import { firebase } from '../config/firebase-init';
@Controller('notification')
export class NotificationController {
  constructor(
    @Inject(Services.NOTIFICATION) private notificationService: INotificationService,
  ) { }

  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto) {
    // return this.notificationService.create(createNotificationDto);
  }

  @Get()
  findAll() {
    // return this.notificationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // return this.notificationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
    // return this.notificationService.update(+id, updateNotificationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    // return this.notificationService.remove(+id);
  }

  @Public()
  @Post('saveToken')
  async saveToken(@Body() body: notification_token_Dto) {
    return this.notificationService.createNotificationToken(body);
  }

  @Get('admin-notifications')
  async getNotifications() {
    return await this.notificationService.getNotifications();
  }

  @Get('generate-token-fcm')
  async generateToken() {
    const token = await admin.credential.applicationDefault()?.getAccessToken(); 
    return {
      token: token?.access_token,
    };
  }
}
