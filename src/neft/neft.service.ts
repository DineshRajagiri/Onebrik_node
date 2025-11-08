import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { neft, neftDetails } from 'src/schema/neft.schema';
import { neftDTO } from './dto/neft.dto';
import { neftStatus } from 'src/utils/constants';
import { wallet, walletDetails } from 'src/schema/wallet.schema';

@Injectable()
export class NeftService {
    private readonly logger = new Logger(NeftService.name);
    constructor(
        @InjectModel(neft.name) private readonly neft: Model<neftDetails>,
         @InjectModel(wallet.name) private wallet: Model<walletDetails>

    ) { }
    // async createNeft(data: neftDTO, file?: any, req?: any) {
    //     try {
    //         const existingNeft = await this.neft.findOne({ transactionID: data.transactionID });

    //         if (existingNeft) {
    //             return {
    //                 success: false,
    //                 statusCode: HttpStatus.CONFLICT,
    //                 message: `Request already send with this transactionID ${data.transactionID}`,
    //             };
    //         }
    //         const createdByUserID = req.user.userId;

    //         data.uploadImage = file;

    //         const savedNeft = await this.neft.create(data);
    //         if (!savedNeft) {
    //             throw new HttpException(
    //                 { success: false, message: 'Unable to create Neft' },
    //                 HttpStatus.INTERNAL_SERVER_ERROR,
    //             );
    //         }
    //         await this.neft.updateOne({ _id: savedNeft._id }, { neftStatus: savedNeft.status });

    //         return {
    //             success: true,
    //             statusCode: HttpStatus.CREATED,
    //             message: 'neft created successfully',
    //             neft: savedNeft,
    //         };
    //     } catch (error) {
    //         throw new HttpException(
    //             { success: false, statusCode: HttpStatus.BAD_REQUEST, message: error.message || 'An error occurred' },
    //             HttpStatus.BAD_REQUEST,
    //         );
    //     }
    // }

    // async createNeft(data: neftDTO, file?: any, req?: any) {
    //     try {
    //         const existingNeft = await this.neft.findOne({ transactionID: data.transactionID });
    
    //         if (existingNeft) {
    //             return {
    //                 success: false,
    //                 statusCode: HttpStatus.CONFLICT,
    //                 message: `Request already sent with this transactionID ${data.transactionID}`,
    //             };
    //         }
    //         data.status = neftStatus.PENDING; 
    //         data.uploadImage = file;
    
    //         const savedNeft = await this.neft.create(data);
    //         if (!savedNeft) {
    //             throw new HttpException(
    //                 { success: false, message: 'Unable to create Neft' },
    //                 HttpStatus.INTERNAL_SERVER_ERROR,
    //             );
    //         }
    
    //         await this.neft.updateOne({ _id: savedNeft._id }, { neftStatus: 'pending' });
    
    //         return {
    //             success: true,
    //             statusCode: HttpStatus.CREATED,
    //             message: 'NEFT created successfully',
    //             neft: savedNeft,
    //         };
    //     } catch (error) {
    //         throw new HttpException(
    //             { success: false, statusCode: HttpStatus.BAD_REQUEST, message: error.message || 'An error occurred' },
    //             HttpStatus.BAD_REQUEST,
    //         );
    //     }
    // }

    async createNeft(data: neftDTO, file?: any, req?: any) {
        try {
           
            const userId = data.userId;
    
            if (!userId) {
                throw new HttpException(
                    { success: false, message: 'User ID is missing. Unauthorized request.' },
                    HttpStatus.BAD_REQUEST, 
                );
            }
    
            const existingNeft = await this.neft.findOne({ transactionID: data.transactionID });
    
            if (existingNeft) {
                return {
                    success: false,
                    statusCode: HttpStatus.CONFLICT,
                    message: `Request already sent with this transactionID ${data.transactionID}`,
                };
            }
    
            data.status = neftStatus.PENDING; 
            data.uploadImage = file; 
            data.userId = userId; 
    
            const savedNeft = await this.neft.create(data);
    
            if (!savedNeft) {
                throw new HttpException(
                    { success: false, message: 'Unable to create NEFT' },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
    
            await this.neft.updateOne({ _id: savedNeft._id }, { neftStatus: neftStatus.PENDING });
    
            return {
                success: true,
                statusCode: HttpStatus.CREATED,
                message: 'NEFT created successfully',
                neft: savedNeft, 
            };
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
      
    async updateNeftStatus(id: string, data: any) {
        const { status, remark } = data;
      
        const existingNeft = await this.neft.findById(id);
        if (!existingNeft) {
          throw new HttpException(
            { success: false, message: 'NEFT transaction not found' },
            HttpStatus.NOT_FOUND
          );
        }
      
        existingNeft.status = status;
      
        if (status === neftStatus.REJECTED) {
          existingNeft.remarks =
            remark && remark.trim() !== ''
              ? remark
              : 'Rejected due to incorrect or insufficient details';
        }
      
        const updatedNeft = await existingNeft.save();
      
        if (status === neftStatus.APPROVED) {
          const walletAmount = parseFloat(existingNeft.amount);
      
          await this.wallet.findOneAndUpdate(
            { userId: existingNeft.userId, isTransaction: false },
            {
              $inc: { walletBalance: walletAmount },
              $setOnInsert: {
                investedAmount: 0,
                gainedAmount: 0,
                transactions: [],
                isTransaction: false,
              },
            },
            { upsert: true, new: true }
          );
        }
        if (status === neftStatus.REJECTED) {
          return {
            success: true,
            message: `NEFT status updated to ${status}`,
            remark: existingNeft.remarks,
          };
        } else {
          return {
            success: true,
            message: `NEFT status updated to ${status}`,
            status: updatedNeft.status,
          };
        }
      }
       
      async getNeftTransactionsByUserId(
        userId: string,
        page = 1,
        limit = 10,
        search = '',
        status = ''
    ): Promise<{
        success: boolean;
        neft: any[];
        total: number;
        approvedCount: number;
        rejectedCount: number;
        pendingCount: number;
        page: number;
        limit: number;
    }> {
        try {
            const skip = (page - 1) * limit;
    
            const searchFilter: any = {
                userId: userId, 
            };
    
            if (search) {
                searchFilter.transactionID = { $regex: search, $options: 'i' };
            }
    
            if (status) {
                searchFilter.status = status;
            }
    
            console.log('searchFilter:', searchFilter); 
    
            const [neft, total, approvedCount, rejectedCount, pendingCount] = await Promise.all([
                this.neft.find(searchFilter).skip(skip).limit(limit).sort({ Date: -1 }),
                this.neft.countDocuments(searchFilter),
                this.neft.countDocuments({ ...searchFilter, status: 'APPROVED' }),
                this.neft.countDocuments({ ...searchFilter, status: 'REJECTED' }),
                this.neft.countDocuments({ ...searchFilter, status: 'PENDING' }),
            ]);
    
            return {
                success: true,
                neft,
                total,
                approvedCount,
                rejectedCount,
                pendingCount,
                page,
                limit,
            };
        } catch (error) {
            throw new HttpException(
                { success: false, message: error.message || 'Failed to fetch NEFT transactions' },
                HttpStatus.BAD_REQUEST
            );
        }
    }
    
    async getNeftStatus(): Promise<{
        success: boolean;
        message: string;
        totalNeftTransactions: number;
        approvedNeft: number;
        pendingNeft: number;
        rejectedNeft: number;
        newNeftToday: number;
    }> {
        try {

            const today = new Date();
            today.setHours(0, 0, 0, 0);


            const [totalNeftTransactions, approvedNeft, pendingNeft, rejectedNeft, newNeftToday] = await Promise.all([
                this.neft.countDocuments(),
                this.neft.countDocuments({ status: 'APPROVED' }),
                this.neft.countDocuments({ status: 'PENDING' }),
                this.neft.countDocuments({ status: 'REJECTED' }),
                this.neft.countDocuments({ createdAt: { $gte: today } })
            ]);

            return {
                success: true,
                message: 'Neft statistics fetched successfully.',
                totalNeftTransactions,
                approvedNeft,
                pendingNeft,
                rejectedNeft,
                newNeftToday
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to fetch Neft statistics.',
                totalNeftTransactions: 0,
                approvedNeft: 0,
                pendingNeft: 0,
                rejectedNeft: 0,
                newNeftToday: 0
            };
        }
    }


    async UpdateNeft(id: string, data: any, file: string, req: any) {
        try {
            const existingNeft = await this.neft.findById(id);

            if (!existingNeft) {
                return {
                    success: false,
                    statusCode: HttpStatus.NOT_FOUND,
                    message: `NEFT not found with id ${id}`,
                };
            }


            const transactionExists = await this.neft.findOne({
                transactionID: data.transactionID,
                _id: { $ne: id },
            });

            if (transactionExists && transactionExists.status !== neftStatus.REJECTED) {
                return {
                    success: false,
                    statusCode: HttpStatus.CONFLICT,
                    message: `Request already sent with this transactionID ${data.transactionID}`,
                };
            }

            if (existingNeft.status !== neftStatus.REJECTED) {
                return {
                    success: false,
                    statusCode: HttpStatus.CONFLICT,
                    message: `Only REJECTED NEFT transactions can be updated.`,
                };
            }

            const uploadImage = file || existingNeft.uploadImage;

            const updated = await this.neft.findByIdAndUpdate(
                id,
                {
                    ...data,
                    uploadImage,
                    neftStatus: data.status,
                    transactionID: existingNeft.transactionID,
                },
                { new: true },
            );

            return {
                success: true,
                statusCode: HttpStatus.OK,
                message: 'Rejected NEFT updated successfully',
                neft: updated,
            };
        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: error.message || 'An error occurred while updating NEFT',
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }


    async getAllNeft(
        page = 1,
        limit = 10,
        search = '',
        status = ''
    ): Promise<{
        success: boolean;
        neft: any[];
        total: number;
        approvedCount: number;
        rejectedCount: number;
        pendingCount: number;
        page: number;
        limit: number;
    }> {
        try {
            const skip = (page - 1) * limit;


            const searchFilter: any = {};

            if (search) {
                searchFilter.transactionID = { $regex: search, $options: 'i' };
            }

            if (status) {
                searchFilter.status = status;
            }


            const [neft, total, approvedCount, rejectedCount, pendingCount] = await Promise.all([
                this.neft.find(searchFilter).skip(skip).limit(limit),
                this.neft.countDocuments(),
                this.neft.countDocuments({ status: 'APPROVED' }),
                this.neft.countDocuments({ status: 'REJECTED' }),
                this.neft.countDocuments({ status: 'PENDING' }),
            ]);

            return {
                success: true,
                neft,
                total,
                approvedCount,
                rejectedCount,
                pendingCount,
                page,
                limit,
            };
        } catch (error) {
            throw new HttpException(
                { success: false, message: error.message || 'Failed to fetch enterprises' },
                HttpStatus.BAD_REQUEST
            );
        }
    }


}
