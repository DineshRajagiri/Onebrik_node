import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { Services } from 'src/utils/constants';
import { IUsersService } from './users';
import { walletDTO } from './DTO/wallet.dto';
import { Public } from 'src/decorators/public.decorator';
import { AadharDTO } from './DTO/aadhar.dto';
import { PanDTO } from './DTO/pan.dto';
import { NomineeDTO } from './DTO/nominee.dto';
import { BankDetailsDTO } from './DTO/bankdetails.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { OtherDetailsDTO } from './DTO/otherDetails.dto';
import { profileImageDTO } from './DTO/profileImage.dto';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
export class UsersController {
  constructor(
    @Inject(Services.USERS) private userService: IUsersService,
  ) { }

  @Post('userwalletDetails')
  async addMoneyToWallet(@Body() data: walletDTO) {
    return await this.userService.addMoneyToWallet(data);
  }


  @UseGuards(AuthGuard('jwt'))
  @Get('getWalletBalanceById/:userId')
  async getWalletBalanceById(@Param('userId') userId: string) {
    return this.userService.getWalletBalanceById(userId);
  }
  

  @Get('getWalletTransactionHistory')
  async getWalletTransactionHistory(@Query('userId') userId: string) {
    return await this.userService.getWalletTransactionHistory(userId);
  }

  @Post('aadharDetails')
  async aadharDetails(@Body() body: AadharDTO) {
    return await this.userService.aadharDetails(body);
  }

  @Post('panDetails')
  async panDetails(@Body() body: PanDTO) {
    return await this.userService.panDetails(body);
  }

  @Post('nomineeDetails')
  async nomineeDetails(@Body() body: NomineeDTO) {
    return await this.userService.nomineeDetails(body);
  }

  @Get('getNomineeDetailsById/:id')
  async getNomineeDetailsById(@Param('id') id: string) {
    return this.userService.getNomineeDetailsById(id);
  }

  @Post('bankDetails')
  @UseInterceptors(
    FileInterceptor('uploadBankDetail', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const originalName = file.originalname.replace(/\s+/g, '-');
          const fileName = `${uniqueSuffix}-${originalName}`;
          callback(null, fileName);
        },
      }),
    }),
  )
  async bankDetails(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: BankDetailsDTO,
  ) {
    return this.userService.bankDetails(body, file);
  }

  @Get('getBankDetailsById/:id')
  async getBankDetailsById(@Param('id') id: string) {
    return this.userService.getBankDetailsById(id);
  }

  @Post('otherDetails')
  async otherDetails(@Body() body: OtherDetailsDTO) {
    return await this.userService.otherDetails(body);
  }

  @Get('getAllUsers')
  async getAllUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('createdAt') createdAt?: string,
    @Query('status') statusCode?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    try {
      return await this.userService.getAllUsers(
        Number(page) || 1,
        Number(limit) || 10,
        search || '',
        createdAt,
        statusCode,
        fromDate,
        toDate
      );
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message || 'Failed to fetch users' },
        HttpStatus.BAD_REQUEST
      );
    }
  }
  
  @Post('userProfile')
  @UseInterceptors(
    FileInterceptor('profileImage', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const originalName = file.originalname.replace(/\s+/g, '-');
          const fileName = `${uniqueSuffix}-${originalName}`;
          callback(null, fileName);
        },
      }),
    }),
  )

  async userProfile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: profileImageDTO,
    @Req() req: Request
  ) {
    let fileUrl = null;

    if (file) {
      const host = req.protocol + '://' + req.get('host');
      fileUrl = `${host}/uploads/${file.filename}`;
    }

    return this.userService.userProfile(body, fileUrl);
  }
  @Get('/userProfile/:userId')
  async getUserProfileById(@Param('userId') userId: string) {
    return this.userService.getUserProfileById(userId);
  }

  @Get('getUserById/:id')
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }
  @Get('dashboardStats')
  async getUserStatistics() {
    return this.userService.getUserStats();
  }
  @Put('updateUser/:id')
  async updateUser(@Param('id') userId: string, @Body() updateData: any) {
    try {
      const result = await this.userService.updateUser(userId, updateData);
      return result;
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

  @Put('updateNomineeDetails/:id')
  async updateNomineeDetails(@Param('id') id: string, @Body() body: NomineeDTO) {
    return await this.userService.updateNomineeDetails(id, body);
  }
  @Put('updateBankDetails/:id')
  async updateBankDetails(@Param('id') id: string, @Body() body: BankDetailsDTO) {
    return await this.userService.updateBankDetails(id, body);
  }


  @Post('updateUserStatus')
  async updateUserStatus(@Body() body: any) {
    return await this.userService.updateUserStatus(body);
  }

  @Delete('deleteUser/:id')
  async deleteUser(@Param('id') id: string) {
    try {
      return await this.userService.deleteUser(id);
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message || 'Failed to delete user' },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('getDeletedUsers')
async getDeletedUsers(
  @Query('page') page?: number,
  @Query('limit') limit?: number,
  @Query('search') search?: string,
  @Query('createdAt') createdAt?: string
) {
  try {
    return await this.userService.getDeletedUsers(
      Number(page) || 1,
      Number(limit) || 10,
      search || '',
      createdAt
    );
  } catch (error) {
    throw new HttpException(
      { success: false, message: error.message || 'Failed to fetch deleted users' },
      HttpStatus.BAD_REQUEST
    );
  }
}
@Get('getUserDetailsById/:id')
async getUserDetailsById(@Param('id') userId: string) {
  try {
    const response = await this.userService.getUserDetailsById(userId);

    if (response.success && response.user) {
      response.user.profileImage = response.user.profileImage || null; 
    }

    return response;
  } catch (error) {
    throw new HttpException(
      { success: false, message: error.message || 'Failed to fetch user' },
      HttpStatus.BAD_REQUEST
    );
  }
}

@Post('notify-upcoming-deals-to-users')
async notifyUsersForUpcomingDeals(): Promise<any> {
  return this.userService.notifyUsersForUpcomingDeals();
}

@Post('createUpiPayment')
async createUpiPayment(@Body() body: any) {
  return await this.userService.createUpiPayment(body);
}
@Get('getTransactions/:userId')
async getTransactions(@Param('userId') userId: string) {
  return await this.userService.getTransactionsById(userId);
}

@Get('getAllUpiTransactions')
async getAllUpiTransactions(@Query() query: any) {
  return await this.userService.getAllUpiTransactions(query);
}

}