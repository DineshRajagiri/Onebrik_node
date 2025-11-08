import { Body, Controller, Get, HttpStatus, Inject, Param, Patch, Post, Put, Query, ValidationPipe } from '@nestjs/common';
import { withdrawalDTO } from './dto/withdrawal.dto';
import { Services, withdrawalStatus } from 'src/utils/constants';
import { IwithdrawalService } from './withdrawal';

@Controller('withdrawal')
export class WithdrawalController {
  constructor(
    @Inject(Services.WITHDRAWAL) private WithdrawalService: IwithdrawalService,
  ) { }

  @Post('createWithdrawal')
  async createWithdrawal(@Body(new ValidationPipe()) data: withdrawalDTO) {
    return await this.WithdrawalService.createWithdrawal(data);
  }


  @Patch('updateStatus/:userId')
  async updateWithdrawalStatus(
    @Param('userId') userId: string,
    @Body() body: { status: withdrawalStatus; remarks?: string }
  ) {
    const { status, remarks } = body;
    return this.WithdrawalService.updateWithdrawalStatus(userId, status, remarks);
  }
  

  @Get('withdrawalHistory/:userId')
  async getWithdrawalHistoryByUserId(@Param('userId') userId: string) {
    try {
      const result = await this.WithdrawalService.getWithdrawalHistoryByUserId(userId);

      return {
        success: result.success,
        statusCode: result.statusCode,
        message: result.message,
        withdrawals: result.withdrawals,
      };
    } catch (e) {
      return {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: e?.message || 'An error occurred while fetching the withdrawal history',
      };
    }
  }



  @Get('getallWithdrawals')
  async getAllWithdrawals(
    @Query('page') page: number = 1, 
    @Query('limit') limit: number = 100, 
  ) {
    try {
      const result = await this.WithdrawalService.getAllWithdrawals(page, limit);
      return {
        success: result.success,
        statusCode: result.statusCode,
        message: result.message,
        withdrawals: result.withdrawals,
        total: result.total, 
        page,
        limit,
      };
    } catch (e) {
      return {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: e?.message || 'An error occurred while fetching all withdrawals',
      };
    }
  }
  
 
  @Get('withdrawalCountAPI')
  async getWithdrawalStatus() {
      return this.WithdrawalService.getWithdrawalStatus();
  }
}
