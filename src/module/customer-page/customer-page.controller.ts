import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CustomerPageService } from './customer-page.service';
import { Public } from 'src/decorators/public.decorator';
import { CreateSubCursorDto } from './dto/sub.dto';

@Controller('customerPage')
export class CustomerpageController {
  constructor(private readonly customerPageService: CustomerPageService) { }

  @Public()
  @Get('getHeaderMaindata')
  async customerViewedheader() {
    const data = await this.customerPageService.customerViewedheader();
    return data
  }
  @Public()
  @Get('getSubCatHearder')
  async customerViewedSubCatheader() {
    const data = await this.customerPageService.customerViewedSubCatheader();
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

  @Public()
  @Get("getLatestProducts")
  async getLatestProducts(@Query() query: any) {
    return this.customerPageService.getLatestProducts(query);
  }

  @Public()
  @Post('getProductsBySubCategory')
  async getProductsBySubCategory(@Query() query: any, @Body() body: { id: string }) {
    return this.customerPageService.getProductsBySubCategory(query, body);
  }
  @Public()
  @Get('getAllProducts')
  async getAllProducts(@Query() query: any) {
    return await this.customerPageService.getAllProducts(query);
  }

}

