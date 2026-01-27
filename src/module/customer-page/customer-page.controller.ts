import {
  Body,
  Controller,
  Get,
  Post
} from '@nestjs/common';
import { CustomerPageService } from './customer-page.service';
import { Public } from 'src/decorators/public.decorator';
import { CreateSubCursorDto } from './dto/sub.dto';

@Controller('customerPage')
export class CustomerpageController {
  constructor( private readonly customerPageService: CustomerPageService ) {}

  @Public()
  @Get('getHeaderMaindata')  
  async customerViewedheader() {
   const data = await this.customerPageService.customerViewedheader();
    return data
  }

  @Public()
  @Post('getSubheaderMaindata')  
  async customerViewedSubheader(@Body() body: { id: string }) {
   const data = await this.customerPageService.customerViewedSubheader(body.id);
  return data
  }

  @Public()
  @Post('getSubCatHeaderMaindata')  
  async getSubHeaderMaindata() {
   const data = await this.customerPageService.getSubHeaderMaindata();
  return data
  }


  @Public()
  @Post('CreateSubCursor')  
  async getAttributesByCategory(@Body() body: CreateSubCursorDto) {
   const data = await this.customerPageService.getAttributesByCategory(body);
  return data
  }

  @Public()
  @Get('GetSubCursor')  
  async GetSubCursor() {
   const data = await this.customerPageService.GetSubCursor();
  return data
  }
}

