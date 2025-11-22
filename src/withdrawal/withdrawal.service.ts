import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { withdrawalDTO } from './dto/withdrawal.dto';
import { withdrawal, withdrawalDetails } from 'src/schema/withdrawal.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/schema/user.schema';
import { wallet, walletDetails } from 'src/schema/wallet.schema';
import { withdrawalStatus } from 'src/utils/constants';

@Injectable()
export class WithdrawalService {
 private readonly logger = new Logger(WithdrawalService.name);
 constructor(
    @InjectModel(wallet.name) private wallet: Model<walletDetails>,
    @InjectModel(User.name) private readonly user: Model<UserDocument>,
    @InjectModel(withdrawal.name) private readonly withdrawal: Model<withdrawalDetails>,
  ) { }

  async createWithdrawal(data: withdrawalDTO): Promise<{ success: boolean; statusCode: number; message: string; withdrawal: { status: string; requestedOn: Date; dateOfTransaction: string | Date; amountRequested: number; userId: string; }; }> {
    try {
      const wallet = await this.wallet.findOne({ userId: data.userId, isTransaction: false });
      if (!wallet) {
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Wallet not found for the user',
          withdrawal: null,
        };
      }
  
      const withdrawalRecord = new this.withdrawal({
        amount: data.amount,
        dateOfTransactions: "N/A",
        requestedOn: new Date(),
        amountRequested: data.amount,
        remarks: data.remarks || '',
        userId: data.userId,
        status: withdrawalStatus.PENDING,
      });
  
      await withdrawalRecord.save();
  
      if (withdrawalRecord.status === withdrawalStatus.APPROVED) {
        if (wallet.walletBalance < data.amount) {
          return {
            success: false,
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Insufficient wallet balance for withdrawal',
            withdrawal: null,
          };
        }
  
        wallet.walletBalance -= data.amount;
        withdrawalRecord.dateOfTransaction = new Date();
        await wallet.save();
        await withdrawalRecord.save();
      }
  
      if ([withdrawalStatus.REJECTED, withdrawalStatus.CANCELLED].includes(withdrawalRecord.status)) {
        withdrawalRecord.remarks = data.remarks || 'No remarks provided'; 
        await withdrawalRecord.save();
      }
  
      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Withdrawal created successfully',
        withdrawal: {
          status: withdrawalRecord.status,
          requestedOn: withdrawalRecord.requestedOn,
          dateOfTransaction: withdrawalRecord.status === withdrawalStatus.PENDING ? "N/A" : withdrawalRecord.dateOfTransaction,
          amountRequested: withdrawalRecord.amountRequested,
          userId: withdrawalRecord.userId,  // Added userId in the response
        },
      };
    } catch (e) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: e?.message || 'An error occurred while processing the withdrawal',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  

// async updateWithdrawalStatus(
//     userId: string,
//     status: withdrawalStatus
//   ): Promise<{ success: boolean; statusCode: number; message: string; data?: any }> {
//     try {
//       const withdrawalRecord = await this.withdrawal.findOne({
//         userId: userId,
//         status: withdrawalStatus.PENDING,
//       }).sort({ createdAt: -1 }); 
  
//       if (!withdrawalRecord) {
//         return {
//           success: false,
//           statusCode: HttpStatus.NOT_FOUND,
//           message: 'Withdrawal record not found',
//         };
//       }
//       withdrawalRecord.status = status;
  
//       if (status === withdrawalStatus.APPROVED) {
//         const wallet = await this.wallet.findOne({ userId: userId, isTransaction: false });
//         if (!wallet) {
//           return {
//             success: false,
//             statusCode: HttpStatus.NOT_FOUND,
//             message: 'Wallet not found for the user',
//           };
//         }
  
//         if (wallet.walletBalance < withdrawalRecord.amountRequested) {
//           return {
//             success: false,
//             statusCode: HttpStatus.BAD_REQUEST,
//             message: 'Insufficient wallet balance for withdrawal',
//           };
//         }
//         wallet.walletBalance -= withdrawalRecord.amountRequested;
  
//         await wallet.save();
//         withdrawalRecord.dateOfTransaction = new Date();
//       }
//       await withdrawalRecord.save();
  
//       return {
//         success: true,
//         statusCode: HttpStatus.OK,
//         message: `Withdrawal status updated to ${status}`,
//         data: {
//           status: withdrawalRecord.status,
//           requestedOn: withdrawalRecord.createdAt,
//           dateOfTransaction: withdrawalRecord.dateOfTransaction || null,
//           amountRequested: withdrawalRecord.amountRequested,
//         },
//       };
//     } catch (e) {
//       throw new HttpException(
//         {
//           success: false,
//           statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
//           message: e?.message || 'An error occurred while updating the withdrawal status',
//         },
//         HttpStatus.INTERNAL_SERVER_ERROR
//       );
//     }
//   }
async updateWithdrawalStatus(
  userId: string,
  status: withdrawalStatus,
  remark?: string
): Promise<{ success: boolean; statusCode: number; message: string; data?: any }> {
  try {
    const withdrawalRecord = await this.withdrawal.findOne({
      userId: userId,
      status: withdrawalStatus.PENDING,
    }).sort({ createdAt: -1 }); 

    if (!withdrawalRecord) {
      return {
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Withdrawal record not found',
      };
    }
    withdrawalRecord.status = status;
    if (status === withdrawalStatus.CANCELLED || status === withdrawalStatus.REJECTED) {
      withdrawalRecord.remarks = remark || 'No reason provided';
    }

    if (status === withdrawalStatus.APPROVED) {
      const wallet = await this.wallet.findOne({ userId: userId, isTransaction: false });
      if (!wallet) {
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Wallet not found for the user',
        };
      }

      if (wallet.walletBalance < withdrawalRecord.amountRequested) {
        return {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Insufficient wallet balance for withdrawal',
        };
      }
      wallet.walletBalance -= withdrawalRecord.amountRequested;

      await wallet.save();
      withdrawalRecord.dateOfTransaction = new Date();
    }
    await withdrawalRecord.save();

    const responseData = {
      status: withdrawalRecord.status,
      requestedOn: withdrawalRecord.createdAt,
      dateOfTransaction: withdrawalRecord.dateOfTransaction || null,
      amountRequested: withdrawalRecord.amountRequested,
    };

    if (status === withdrawalStatus.CANCELLED || status === withdrawalStatus.REJECTED) {
      responseData['remark'] = withdrawalRecord.remarks;
    }

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: `Withdrawal status updated to ${status}`,
      data: responseData,
    };
  } catch (e) {
    throw new HttpException(
      {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: e?.message || 'An error occurred while updating the withdrawal status',
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
async getWithdrawalHistoryByUserId(userId: string): Promise<{ success: boolean; statusCode: number; message: string; withdrawals: { status: string; requestedOn: Date; dateOfTransaction: string | Date; amountRequested: number; remark?: string; userId: string; }[] }> {
  try {

    const withdrawalRecords = await this.withdrawal.find({ userId }).sort({ requestedOn: -1 });

    if (!withdrawalRecords || withdrawalRecords.length === 0) {
      return {
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: 'No withdrawal history found for this user',
        withdrawals: [],
      };
    }

    const formattedWithdrawals = withdrawalRecords.map(record => {
      const withdrawalData: any = {
        status: record.status,
        requestedOn: record.requestedOn,
        dateOfTransaction: record.status === withdrawalStatus.PENDING ? "N/A" : record.dateOfTransaction,
        amountRequested: record.amountRequested,
        userId: record.userId,  // Include userId in the response
      };

      // Only include remarks for CANCELLED or REJECTED statuses
      if ([withdrawalStatus.CANCELLED, withdrawalStatus.REJECTED].includes(record.status)) {
        withdrawalData.remark = record.remarks || 'No remarks provided';
      }

      return withdrawalData;
    });

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Withdrawal history fetched successfully',
      withdrawals: formattedWithdrawals,
    };
  } catch (e) {
    throw new HttpException(
      {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: e?.message || 'An error occurred while fetching the withdrawal history',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}


  

  
  
async getAllWithdrawals(page = 1, limit = 10): Promise<{
  success: boolean;
  statusCode: number;
  message: string;
  withdrawals: { status: string; requestedOn: Date; dateOfTransaction: string | Date; amountRequested: number; remark?: string; userId: string; }[];
  total: number;
}> {
  try {
    const skip = (page - 1) * limit;

    const [withdrawals, total] = await Promise.all([
      this.withdrawal.find().skip(skip).limit(limit),
      this.withdrawal.countDocuments(),
    ]);

    const formattedWithdrawals = withdrawals.map(w => {
      const withdrawalData: any = {
        status: w.status,
        requestedOn: w.requestedOn,
        dateOfTransaction: w.status === withdrawalStatus.PENDING ? "N/A" : w.dateOfTransaction,
        amountRequested: w.amountRequested,
        userId: w.userId,
      };
      if ([withdrawalStatus.CANCELLED, withdrawalStatus.REJECTED].includes(w.status)) {
        withdrawalData.remark = w.remarks || 'No remarks provided';
      }

      return withdrawalData;
    });

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Withdrawals fetched successfully',
      withdrawals: formattedWithdrawals,
      total,
    };
  } catch (e) {
    throw new HttpException(
      {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: e?.message || 'An error occurred while fetching withdrawals',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

  
async getWithdrawalStatus(): Promise<{
  success: boolean;
  message: string;
  totalWithdrawalTransactions: number;
  approvedWithdrawal: number;
  pendingWithdrawal: number;
  cancelledWithdrawal: number;
  newWithdrawalToday: number;
}> {
  try {

      const today = new Date();
      today.setHours(0, 0, 0, 0);


      const [totalWithdrawalTransactions, approvedWithdrawal, pendingWithdrawal, cancelledWithdrawal, newWithdrawalToday] = await Promise.all([
          this.withdrawal.countDocuments(),
          this.withdrawal.countDocuments({ status: 'APPROVED' }),
          this.withdrawal.countDocuments({ status: 'PENDING' }),
          this.withdrawal.countDocuments({ status: 'CANCELLED' }),
          this.withdrawal.countDocuments({ createdAt: { $gte: today } })
      ]);

      return {
          success: true,
          message: 'Withdrawal statistics fetched successfully.',
          totalWithdrawalTransactions,
          approvedWithdrawal,
          pendingWithdrawal,
          cancelledWithdrawal,
          newWithdrawalToday
      };
  } catch (error) {
      return {
          success: false,
          message: error.message || 'Failed to fetch Withdrawal statistics.',
          totalWithdrawalTransactions: 0,
          approvedWithdrawal: 0,
          pendingWithdrawal: 0,
          cancelledWithdrawal: 0,
          newWithdrawalToday: 0
      };
  }
} 
  
    
}
