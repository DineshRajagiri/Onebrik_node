import { Controller, Get } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public } from 'src/decorators/public.decorator';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}


  @Public()
  @Get('test')
  async sendMail() {
    return this.mailService.sendMail( 'Bhushan.moreyeahs@gmail.com', 'This is a test mail', 'TestPassword123');
  }
}
