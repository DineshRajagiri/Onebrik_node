import { Body, HttpException, HttpStatus, Injectable, NotFoundException, Param, Put, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { wallet, walletDetails } from 'src/schema/wallet.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { walletDTO } from './DTO/wallet.dto';
import { AadharDTO } from './DTO/aadhar.dto';
import { user, UserDocument } from 'src/schema/user.schema';
import { PanDTO } from './DTO/pan.dto';
import { NomineeDTO } from './DTO/nominee.dto';
import { BankDetailsDTO } from './DTO/bankdetails.dto';
import { OtherDetailsDTO } from './DTO/otherDetails.dto';
import { profileImageDTO } from './DTO/profileImage.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Types } from 'mongoose';
import { Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import twilio from 'twilio';
import { deals, DealsDocument } from 'src/schema/deals.schema';
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
      

  constructor(
    @InjectModel(wallet.name) private wallet: Model<walletDetails>,
    @InjectModel(user.name) private readonly user: Model<UserDocument>,
    @InjectModel(deals.name) private readonly deals: Model<DealsDocument>,
  ) { }

  async addMoneyToWallet(data: walletDTO) {
    try {
      const { userId, walletBalance } = data;
  
      const amountToAdd = Number(walletBalance);
      if (isNaN(amountToAdd) || amountToAdd <= 0) {
        return {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid amount provided. Must be a positive number.',
        };
      }
  
      let wallet = await this.wallet.findOne({ userId });
      if (!wallet) {
        wallet = new this.wallet({
          userId,
          walletBalance: amountToAdd,
          investedAmount: 0,
          gainedAmount: 0,
          transactions: [
            { amount: amountToAdd, type: 'credit', timestamp: new Date() },
          ],
        });
  
        const newWallet = await wallet.save();
        if (!newWallet) {
          return {
            success: false,
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Failed to create new wallet.',
          };
        }
  
        return {
          success: true,
          statusCode: HttpStatus.CREATED,
          message: 'New wallet created and amount added successfully.',
          data: newWallet,
        };
      }

      wallet.walletBalance += amountToAdd;
      wallet.transactions.push({
        amount: amountToAdd,
        type: 'credit',
        timestamp: new Date(),
      });
  
      const updatedWallet = await wallet.save();
      if (!updatedWallet) {
        return {
          success: false,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to update wallet.',
        };
      }
  
      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Amount added to wallet successfully.',
        data: updatedWallet,
      };
    } catch (e) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: e?.message || 'An error occurred while processing the request.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  


  async getWalletList() {
    try {
      const wallets = await this.wallet.find();

      if (wallets.length === 0) {
        return {
          success: false,
          statusCode: HttpStatus.NO_CONTENT,
          message: 'No wallets found',
        };
      }

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Wallets retrieved successfully',
        wallets,
      };
    } catch (e) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: e?.message || 'An error occurred while fetching wallets',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getWalletBalanceById(userId: string) {
    try {
      const user = await this.user.findById(userId);
  
      if (!user) {
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not found',
        };
      }
  
      const wallet = await this.wallet.findOneAndUpdate(
        { userId, isTransaction: false }, 
        {
          $setOnInsert: {
            walletBalance: 0,
            investedAmount: 0,
            gainedAmount: 0,
            transactions: [],
            isTransaction: false,
          },
        },
        { upsert: true, new: true }
      );
  
      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Wallet balance retrieved successfully',
        data: {
          walletBalance: wallet?.walletBalance?.toFixed(1) ?? '0.0',
          investedAmount: wallet?.investedAmount?.toFixed(1) ?? '0.0',
          gainedAmount: wallet?.gainedAmount?.toFixed(1) ?? '0.0',
        },
      };
    } catch (e) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: e?.message || 'An error occurred while fetching wallet balance',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  

  async getWalletTransactionHistory(userId: string) {
    try {
      const wallet = await this.wallet.findOne({ userId });

      if (!wallet) {
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Wallet not found',
        };
      }

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Transaction history retrieved successfully',
        transactions: wallet.transactions,
      };
    } catch (e) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: e?.message || 'An error occurred while fetching transaction history',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }


  async aadharDetails(data: AadharDTO) {
    try {
      const user = await this.user.findById(data?.userId);

      if (!user) {
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not found',
        };
      }

      const updatedUser = await this.user.findByIdAndUpdate(
        data?.userId,
        {
          $set: {
            aadharName: data.aadharName,
            aadharNumber: data.aadharNumber,
            gender: data.gender,
            dob: data.dob,
            houseNo: data.houseNo,
            street: data.street,
            landMark: data.landMark,
            state: data.state,
            district: data.district,
            country: data.country,
          },
        },
        { new: true }
      );

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Aadhar details added successfully',
        user: updatedUser,
      };
    } catch (e) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: e?.message || 'An error occurred',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async panDetails(data: PanDTO) {
    try {
      const user = await this.user.findById(data?.userId);

      if (!user) {
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not found',
        };
      }

      const updatedUser = await this.user.findByIdAndUpdate(
        data?.userId,
        {
          $set: {
            panNumber: data.panNumber,
          },
        },
        { new: true }
      );

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Pan details added successfully',
        user: updatedUser,
      };
    } catch (e) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: e?.message || 'An error occurred',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async nomineeDetails(data: NomineeDTO) {
    try {
      const user = await this.user.findById(data?.userId);

      if (!user) {
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not found',
        };
      }

      const updatedUser = await this.user.findByIdAndUpdate(
        data?.userId,
        {
          $set: {
            nomineeName: data.nomineeName,
            nomineeEmail: data.nomineeEmail,
            nomineeMobileNumber: data.nomineeMobileNumber,
            relationship: data.relationship,
            nomineeDob: data.nomineeDob,
            nomineeAdress: data.nomineeAdress
          },
        },
        { new: true }
      );

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Nominee details added successfully',
        user: updatedUser,
      };
    } catch (e) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: e?.message || 'An error occurred',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async bankDetails(data: BankDetailsDTO, file: Express.Multer.File) {
    if (!file) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'No file uploaded',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.user.findById(data?.userId);

    if (!user) {
      return {
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: 'User not found',
      };
    }

    const updatedUser = await this.user.findByIdAndUpdate(
      data?.userId,
      {
        $set: {
          accountHolderName: data.accountHolderName,
          accountNumber: data.accountNumber,
          ifscCode: data.ifscCode,
          bankName: data.bankName,
          uploadBankDetail: file ? file.path : null,
        },
      },
      { new: true },
    );

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Bank details added successfully',
      user: updatedUser,
    };
  }

  async otherDetails(data: OtherDetailsDTO) {
    try {
      const user = await this.user.findById(data?.userId);

      if (!user) {
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not found',
        };
      }

      const updatedUser = await this.user.findByIdAndUpdate(
        data?.userId,
        {
          $set: {
            experiences: data.experiences,
            incomeRange: data.incomeRange,
            professions: data.professions
          },
        },
        { new: true }
      );

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Other details added successfully',
        user: updatedUser,
      };
    } catch (e) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: e?.message || 'An error occurred',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  
  // async getAllUsers(
  //   page = 1,
  //   limit = 10,
  //   search = '',
  //   createdAt?: string,
  //   userStatus?: string,
  //   fromDate?: string,
  //   toDate?: string
  // ): Promise<{ success: boolean; users: any[]; total: number; page: number; limit: number }> {
  //   try {
  //     const query: any = { isDeleted: { $ne: true } };
  //     const skip = (page - 1) * limit;
  
  //     if (search) {
  //       query.$or = [
  //         { fullName: { $regex: search, $options: 'i' } },
  //         { email: { $regex: search, $options: 'i' } },
  //         { mobileNumber: { $regex: search, $options: 'i' } },
  //       ];
  //     }
  
  //     if (createdAt) {
  //       query.createdAt = { $gte: new Date(createdAt) };
  //     }
  
  //     if (userStatus) {
  //       query.userStatus = userStatus;
  //     }
  
  //     const [users, total] = await Promise.all([
  //       this.user.find(query).skip(skip).limit(limit),
  //       this.user.countDocuments(query),
  //     ]);
  //     const dealQuery: any = {
  //       $or: [
  //         { userId: { $in: users.map((user: any) => user.customerId) } },
  //         { userId: { $in: users.map((user: any) => user._id) } },
  //       ],
  //     };
  
  //     if (fromDate && toDate) {
  //       dealQuery.dealStartDate = {
  //         $gte: new Date(fromDate),
  //         $lte: new Date(toDate),
  //       };
  //     }
  
  //     const deals = await this.deals.find(dealQuery);
  
  //     const usersWithDeals = users.map((user: any) => {
  //       const userDeals = deals.filter((deal: any) =>
  //         deal.userId?.toString() === user.customerId?.toString() || deal.userId?.toString() === user._id?.toString()
  //       );
  
  //       return {
  //         ...user.toObject(),
  //         dealPurchased: userDeals.map((deal: any) => deal.purchasedValue).join(', '),
  //         dealAmount: userDeals.map((deal: any) => deal.dealValue).join(', '),
  //         tenure: userDeals.map((deal: any) => deal.tenure).join(', '),
  //         dealStatus: userDeals.map((deal: any) => deal.dealStatus).join(', '),
  //         repaymentDate: userDeals.map((deal: any) => deal.repaymentDate).join(', '),
  //         remainingValue: userDeals.map((deal: any) => deal.remainingValue).join(', '),
  //         dealStartDate: userDeals.map((deal: any) => deal.dealStartDate).join(', '),
  //       };
  //     });
  
  //     return {
  //       success: true,
  //       users: usersWithDeals,
  //       total,
  //       page,
  //       limit,
  //     };
  //   } catch (error) {
  //     throw new HttpException(
  //       { success: false, message: error.message || 'Failed to fetch users' },
  //       HttpStatus.BAD_REQUEST
  //     );
  //   }
  // }
  
  // async getAllUsers(
  //   page = 1,
  //   limit = 10,
  //   search = '',
  //   createdAt?: string,
  //   userStatus?: string,
  //   fromDate?: string,
  //   toDate?: string
  // ): Promise<{ success: boolean; users: any[]; total: number; page: number; limit: number }> {
  //   try {
  //     const query: any = { isDeleted: { $ne: true } };
  //     const skip = (page - 1) * limit;
  
  //     if (search) {
  //       query.$or = [
  //         { fullName: { $regex: search, $options: 'i' } },
  //         { email: { $regex: search, $options: 'i' } },
  //         { mobileNumber: { $regex: search, $options: 'i' } },
  //       ];
  //     }
  
  //     if (createdAt) {
  //       query.createdAt = { $gte: new Date(createdAt) };
  //     }
  
  //     if (userStatus) {
  //       query.userStatus = userStatus;
  //     }
  
  //     const [users, total] = await Promise.all([
  //       this.user.find(query).skip(skip).limit(limit),
  //       this.user.countDocuments(query),
  //     ]);
  
  //     const dealQuery: any = {
  //       $or: [
  //         { userId: { $in: users.map((user: any) => user.customerId) } },
  //         { userId: { $in: users.map((user: any) => user._id) } },
  //       ],
  //     };
  
  //     if (fromDate && toDate) {
  //       dealQuery.dealStartDate = {
  //         $gte: new Date(fromDate),
  //         $lte: new Date(toDate),
  //       };
  //     }
  
  //     const deals = await this.deals.find(dealQuery);
  
  //     const usersWithDeals = users.map((user: any) => {
  //       const userDeals = deals.filter((deal: any) =>
  //         deal.userId?.toString() === user.customerId?.toString() ||
  //         deal.userId?.toString() === user._id?.toString()
  //       );
  
  //       const joinDealValues = (key: string) =>
  //         userDeals
  //           .map((deal: any) => deal[key])
  //           .filter((v) => v !== null && v !== undefined && v !== '')
  //           .join(', ') || null;
  
  //       return {
  //         ...user.toObject(),
  //         dealPurchased: joinDealValues('purchasedValue'),
  //         dealAmount: joinDealValues('dealValue'),
  //         tenure: joinDealValues('tenure'),
  //         dealStatus: joinDealValues('dealStatus'),
  //         repaymentDate: joinDealValues('repaymentDate'),
  //         remainingValue: joinDealValues('remainingValue'),
  //         dealStartDate: joinDealValues('dealStartDate'),
  //       };
  //     });
  
  //     return {
  //       success: true,
  //       users: usersWithDeals,
  //       total,
  //       page,
  //       limit,
  //     };
  //   } catch (error) {
  //     throw new HttpException(
  //       { success: false, message: error.message || 'Failed to fetch users' },
  //       HttpStatus.BAD_REQUEST
  //     );
  //   }
  // }
  // async getAllUsers(
  //   page = 1,
  //   limit = 10,
  //   search = '',
  //   createdAt?: string,
  //   userStatus?: string,
  //   fromDate?: string,
  //   toDate?: string
  // ): Promise<{ success: boolean; users: any[]; total: number; page: number; limit: number }> {
  //   try {
  //     const query: any = { isDeleted: { $ne: true } };
  //     const skip = (page - 1) * limit;
  
  //     if (search) {
  //       query.$or = [
  //         { fullName: { $regex: search, $options: 'i' } },
  //         { email: { $regex: search, $options: 'i' } },
  //         { mobileNumber: { $regex: search, $options: 'i' } },
  //       ];
  //     }
  
  //     if (createdAt) {
  //       query.createdAt = { $gte: new Date(createdAt) };
  //     }
  
  //     if (userStatus) {
  //       query.userStatus = userStatus;
  //     }
  
  //     const [users, total] = await Promise.all([
  //       this.user.find(query).skip(skip).limit(limit),
  //       this.user.countDocuments(query),
  //     ]);
  
  //     const dealQuery: any = {
  //       $or: [
  //         { userId: { $in: users.map((user: any) => user.customerId) } },
  //         { userId: { $in: users.map((user: any) => user._id) } },
  //       ],
  //     };
  
  //     if (fromDate && toDate) {
  //       dealQuery.dealStartDate = {
  //         $gte: new Date(fromDate),
  //         $lte: new Date(toDate),
  //       };
  //     }
  
  //     const deals = await this.deals.find(dealQuery);
  
  //     const usersWithDeals: any[] = [];
  
  //     users.forEach((user: any) => {
  //       const userDeals = deals.filter((deal: any) =>
  //         deal.userId?.toString() === user.customerId?.toString() ||
  //         deal.userId?.toString() === user._id?.toString()
  //       );
  
  //       if (userDeals.length === 0) {
  //         // No deals for this user, push user as-is
  //         usersWithDeals.push(user.toObject());
  //       } else {
  //         // Push each deal separately with user info
  //         userDeals.forEach((deal: any) => {
  //           usersWithDeals.push({
  //             ...user.toObject(),
  //             dealPurchased: deal.purchasedValue ?? null,
  //             dealAmount: deal.dealValue ?? null,
  //             tenure: deal.tenure ?? null,
  //             dealStatus: deal.dealStatus ?? null,
  //             repaymentDate: deal.repaymentDate ?? null,
  //             remainingValue: deal.remainingValue ?? null,
  //             dealStartDate: deal.dealStartDate ?? null,
  //           });
  //         });
  //       }
  //     });
  
  //     return {
  //       success: true,
  //       users: usersWithDeals,
  //       total,
  //       page,
  //       limit,
  //     };
  //   } catch (error) {
  //     throw new HttpException(
  //       { success: false, message: error.message || 'Failed to fetch users' },
  //       HttpStatus.BAD_REQUEST
  //     );
  //   }
  // }

  
  // async userProfile(data: profileImageDTO, file: any) {
  //   if (!file) {
  //     throw new HttpException(
  //       {
  //         success: false,
  //         statusCode: HttpStatus.BAD_REQUEST,
  //         message: 'No file uploaded',
  //       },
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }

  //   const user = await this.user.findById(data?.userId);

  //   if (!user) {
  //     return {
  //       success: false,
  //       statusCode: HttpStatus.NOT_FOUND,
  //       message: 'User not found',
  //     };
  //   }

  //   const updatedUser = await this.user.findByIdAndUpdate(
  //     data?.userId,
  //     { $set: { profileImage: file || null } },
  //     { new: true, select: '_id profileImage' }
  //   ).lean();

  //   return {
  //     success: true,
  //     statusCode: HttpStatus.OK,
  //     message: 'User profile added successfully',
  //     user: updatedUser,
  //   };
  // }
  async getAllUsers(
    page = 1,
    limit = 10,
    search = '',
    createdAt?: string,
    userStatus?: string
  ): Promise<{ success: boolean; users: any[]; total: number; page: number; limit: number }> {
    try {
      const query: any = { isDeleted: { $ne: true } };
      const skip = (page - 1) * limit;
  
      if (search) {
        query.$or = [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { mobileNumber: { $regex: search, $options: 'i' } },
        ];
      }
  
      if (createdAt) {
        query.createdAt = { $gte: new Date(createdAt) };
      }
  
      if (userStatus) {
        query.userStatus = userStatus;
      }
  
      const [users, total] = await Promise.all([
        this.user.find(query).skip(skip).limit(limit),
        this.user.countDocuments(query),
      ]);
  
      return {
        success: true,
        users,
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message || 'Failed to fetch users' },
        HttpStatus.BAD_REQUEST
      );
    }
  }
  
  async userProfile(data: profileImageDTO, file: any) {
    if (!file) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'No file uploaded',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
 
    const user = await this.user.findOne({ _id: data?.userId });
  
    if (!user) {
      return {
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: 'User not found',
      };
    }
  
    const updatedUser = await this.user.findOneAndUpdate(
      { _id: data?.userId },
      { $set: { profileImage: file || null } },
      { new: true, projection: { _id: 1, profileImage: 1 } }
    ).lean();
  
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'User profile added successfully',
      user: updatedUser,
    };
  }
  
  async getUserProfileById(userId: string) {
    const user = await this.user.findById(userId).select('profileImage');

    if (!user) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'User profile retrieved successfully',
      profileImage: user.profileImage || null,
    };
  }

  async getBankDetailsById(bankDetailsId: string) {
    try {
      const bankDetails = await this.user.findById(bankDetailsId);
      if (!bankDetails) {
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Bank details not found',
        };
      }
      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Bank details retrieved successfully',
        bankDetails: {
          accountHolderName: bankDetails.accountHolderName,
          accountNumber: bankDetails.accountNumber,
          ifscCode: bankDetails.ifscCode,
          bankName: bankDetails.bankName,
          uploadBankDetail: bankDetails.uploadBankDetail
        }
      };
    } catch (e) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: e?.message || 'An error occurred',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async getNomineeDetailsById(nomineeDetailsId: string) {
    try {
      const nomineeDetails = await this.user.findById(nomineeDetailsId);
      if (!nomineeDetails) {
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'nomineeDetails not found',
        };
      }
      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'nomineeDetails details retrieved successfully',
        nomineeDetails: {
          nomineeName: nomineeDetails.nomineeName,
          nomineeEmail: nomineeDetails.nomineeEmail,
          nomineeMobileNumber: nomineeDetails.nomineeMobileNumber,
          relationship: nomineeDetails.relationship,
          nomineeDob: nomineeDetails.nomineeDob,
          nomineeAdress: nomineeDetails.nomineeAdress

        },
      };
    } catch (e) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: e?.message || 'An error occurred',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async updateNomineeDetails(id: string, updateData: NomineeDTO): Promise<{ success: boolean; message: string; nomineeDetails?: NomineeDTO }> {
    try {
      const nomineeDetails = await this.user.findById(id);
      if (!nomineeDetails) {
        throw new NotFoundException(`NomineeDetails with ID ${id} not found`);
      }

      const updatedNomineeDetails = await this.user.findByIdAndUpdate(id, updateData, { new: true });

      if (!updatedNomineeDetails) {
        throw new HttpException('NomineeDetails update failed', HttpStatus.INTERNAL_SERVER_ERROR);
      }


      const transformedNomineeDetails: NomineeDTO = {
        userId: updatedNomineeDetails._id,
        nomineeName: updatedNomineeDetails.nomineeName,
        nomineeEmail: updatedNomineeDetails.nomineeEmail,
        nomineeMobileNumber: updatedNomineeDetails.nomineeMobileNumber,
        relationship: updatedNomineeDetails.relationship,
        nomineeDob: updatedNomineeDetails.nomineeDob,
        nomineeAdress: updatedNomineeDetails.nomineeAdress,
      };


      return {
        success: true,
        message: 'NomineeDetails updated successfully',
        nomineeDetails: transformedNomineeDetails,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message || 'Update failed' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getUserById(userId: string) {
    try {
      const user = await this.user.findById(userId);
      if (!user) {
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not found',
        };
      }

      const formattedUser = {
        istermAndPolicy: user.istermAndPolicy ?? null,
        _id: user._id ?? null,
        createdAt: user.createdAt ?? null,
        updatedAt: user.updatedAt ?? null,
        isActive: user.isActive ?? null,
        isDeleted: user.isDeleted ?? null,
        email: user.email ?? null,
        fullName: user.fullName ?? null,
        mobileNumber: user.mobileNumber ?? null,
        role: user.role ?? null,
        passwordHash: user.passwordHash ?? null,
        logid: user.logid ?? null,
        isVerified: user.isVerified ?? null,
        isVerifiedByAdmin: user.isVerifiedByAdmin ?? null,
        userStatus: user.userStatus ?? null,
        customerId: user.customerId ?? null,
        nomineeAdress: user.nomineeAdress ?? null,
        nomineeDob: user.nomineeDob ?? null,
        nomineeEmail: user.nomineeEmail ?? null,
        nomineeName: user.nomineeName ?? null,
        relationship: user.relationship ?? null,
        nomineeMobileNumber: user.nomineeMobileNumber ?? null,
        aadharName: user.aadharName ?? null,
        aadharNumber: user.aadharNumber ?? null,
        district: user.district ?? null,
        dob: user.dob ?? null,
        gender: user.gender ?? null,
        houseNo: user.houseNo ?? null,
        landMark: user.landMark ?? null,
        state: user.state ?? null,
        street: user.street ?? null,
        country: user.country ?? null,
        accountHolderName: user.accountHolderName ?? null,
        accountNumber: user.accountNumber ?? null,
        bankName: user.bankName ?? null,
        ifscCode: user.ifscCode ?? null,
        uploadBankDetail: user.uploadBankDetail ?? null,
        profileImage: user.profileImage ?? null,
        __v: user.__v ?? null,
      };

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'User details retrieved successfully',
        user: formattedUser,
      };
    } catch (e) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: e?.message || 'An error occurred',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  //dashboard
  async getUserStats(): Promise<{
    success: boolean;
    message: string;
    totalUsers: number;
    ApprovedUsers: number;
    PendingUsers: number;
    newUsers: number;
  }> {
    try {

      const today = new Date();
      today.setHours(0, 0, 0, 0);


      const [totalUsers, ApprovedUsers, PendingUsers, newUsers] = await Promise.all([
        this.user.countDocuments(),
        this.user.countDocuments({ userStatus: 'Approved' }),
        this.user.countDocuments({ userStatus: 'Pending' }),
        this.user.countDocuments({ createdAt: { $gte: today } })
      ]);

      return {
        success: true,
        message: 'Users statistics fetched successfully.',
        totalUsers,
        ApprovedUsers,
        PendingUsers,
        newUsers
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch users statistics.',
        totalUsers: 0,
        ApprovedUsers: 0,
        PendingUsers: 0,
        newUsers: 0
      };
    }
  }
  async updateUser(userId: string, updateData: any) {
    try {
      const updatedUser = await this.user.findByIdAndUpdate(userId, updateData, {
        new: true, // Return the updated document
        runValidators: true, // Ensure validation rules are applied
      });

      if (!updatedUser) {
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not found',
        };
      }

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'User updated successfully',
        user: updatedUser,
      };
    } catch (e) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: e?.message || 'An error occurred',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async updateBankDetails(id: string, updateData: BankDetailsDTO): Promise<{ success: boolean; message: string; bankDetails?: BankDetailsDTO }> {
    try {
      const bankDetails = await this.user.findById(id);
      if (!bankDetails) {
        throw new NotFoundException(`BankDetails with ID ${id} not found`);
      }

      const updatedBankDetails = await this.user.findByIdAndUpdate(id, updateData, { new: true });

      if (!updatedBankDetails) {
        throw new HttpException('BankDetails update failed', HttpStatus.INTERNAL_SERVER_ERROR);
      }


      const transformedBankDetails: BankDetailsDTO = {
        userId: updatedBankDetails._id,
        accountHolderName: updatedBankDetails.accountHolderName,
        accountNumber: updatedBankDetails.accountNumber,
        ifscCode: updatedBankDetails.ifscCode,
        bankName: updatedBankDetails.bankName

      };


      return {
        success: true,
        message: 'BankDetails updated successfully',
        bankDetails: transformedBankDetails,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message || 'Update failed' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateUserStatus(data: any) {
    try {
      const user = await this.user.findById(data?.userId);

      if (!user) {
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not found',
        };
      }

      const updatedUser = await this.user.findByIdAndUpdate(
        data?.userId,
        {
          $set: {
            userStatus: data.status
          },
        },
        { new: true }
      );

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Users status added successfully',
        user: updatedUser,
      };
    } catch (e) {
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: e?.message || 'An error occurred',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async deleteUser(id: string): Promise<{ success: boolean; message: string; user?}> {
    try {
      const user = await this.user.findById(id);

      if (!user) {
        throw new HttpException(
          { success: false, message: 'User not found' },
          HttpStatus.NOT_FOUND
        );
      }

      const updatedUser = await this.user.findByIdAndUpdate(
        id,
        { $set: { userStatus: 'Rejected', isDeleted: true } }, // Soft delete
        { new: true }
      );

      return {
        success: true,
        message: 'User moved to Rejected list successfully',
        user: updatedUser,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message || 'Failed to update user status' },
        HttpStatus.BAD_REQUEST
      );
    }
  }


  async getDeletedUsers(
    page: number,
    limit: number,
    search: string,
    createdAt?: string
  ): Promise<{ success: boolean; users: any[]; total: number }> {
    try {
      const query: any = { isDeleted: true }; // Filter only deleted users

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      if (createdAt) {
        query.createdAt = { $gte: new Date(createdAt) };
      }

      const users = await this.user
        .find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await this.user.countDocuments(query);

      return {
        success: true,
        users,
        total
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to fetch deleted users' },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async getUserDetailsById(userId: string): Promise<{ success: boolean; user?: any }> {
    try {
      const user = await this.user.findOne({ _id: userId, isDeleted: { $ne: true } })
        .select('customerId fullName userStatus profileImage');

      if (!user) {
        throw new HttpException(
          { success: false, message: 'User not found' },
          HttpStatus.NOT_FOUND
        );
      }

      return { success: true, user };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message || 'Failed to fetch user details' },
        HttpStatus.BAD_REQUEST
      );
    }
  }
  
  async notifyUsersForUpcomingDeals(): Promise<any> {
    try {
      const users = await this.user.find({ role: 'USER', isActive: true });
  
      if (users.length === 0) {
        return { success: false, message: 'No users found.' };
      }
  
      const results = await Promise.all(
        users.map(async (user) => {
          const [emailStatus, pushStatus] = await Promise.all([
            this.sendEmailNotification(user),
            this.sendPushNotification(user)
          ]);
          return { userId: user._id, emailStatus, pushStatus };
        })
      );
  
      return {
        success: true,
        message: 'Notifications sent to all users about upcoming deals.',
        results,
      };
    } catch (error) {
      this.logger.error('Error sending notifications to all users:', error);
      return {
        success: false,
        message: 'Error sending notifications to all users.',
        error,
      };
    }
  }
  
  private async sendEmailNotification(user: any): Promise<'sent' | 'failed'> {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'meruguvamshi1824@gmail.com',
          pass: 'wvmfqwyyjoqnvnog',
        },
      });

      const mailOptions = {
        from: '"Upcoming Deals" <meruguvamshi1824@gmail.com>',
        to: user.email,
        subject: '🔥 Upcoming Deals Await!',
        html: `<p>Hello ${user.name || 'User'},<br/>Don't miss out on our exciting upcoming deals!</p>`,
      };

      await transporter.sendMail(mailOptions);
      this.logger.log(`📧 Email sent to ${user.email}`);
      return 'sent';
    } catch (error) {
      this.logger.error(`❌ Email failed for ${user.email}:`, error);
      return 'failed';
    }
  }
  private async sendPushNotification(user: any): Promise<'sent' | 'failed'> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  
    const client = twilio(accountSid, authToken);
  
    try {
      const formattedNumber = user.mobileNumber.startsWith('+91')
        ? user.mobileNumber
        : `+91${user.mobileNumber}`;
  
      const message = await client.messages.create({
        body: `Hello ${user.name || ''}, exciting deals are coming soon on Invoice Trades! Stay tuned.`,
        messagingServiceSid: messagingServiceSid,
        to: formattedNumber,
      });
  
      this.logger.log(`📲 SMS sent to ${formattedNumber} (SID: ${message.sid})`);
      return 'sent';
    } catch (error) {
      this.logger.error(`❌ SMS send failed for ${user.mobileNumber}:`, error);
      return 'failed';
    }
  }
  
///UPI PAYMENT
async createUpiPayment(
  data: { userId: string; amount: number; status: 'FAILED' | 'SUCCESS' },
): Promise<any> {
  try {
    const newPayment = {
      userId: data.userId,
      amount: data.amount,
      status: data.status,
      paymentType: 'upi',
      isTransaction: true,
      createdAt: new Date(),
    };

    const savedPayment = await this.wallet.create(newPayment);

    if (!savedPayment) {
      throw new HttpException(
        { success: false, message: 'Unable to create UPI payment' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    if (data.status === 'SUCCESS') {
      await this.wallet.findOneAndUpdate(
        { userId: data.userId, isTransaction: false },
        {
          $inc: { walletBalance: data.amount },
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

    const { transactions, ...paymentWithoutTransactions } = savedPayment.toObject();

    return {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: 'UPI payment record created successfully',
      payment: paymentWithoutTransactions,
    };
  } catch (error) {
    throw new HttpException(
      {
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message || 'An error occurred while creating UPI payment',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}


async getTransactionsById(userId: string) {
  try {
    const user = await this.user.findById(userId);

    if (!user) {
      return {
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: 'User not found',
      };
    }

    const userTransactions = await this.wallet.find(
      { userId, paymentType: 'upi' }, 
      { amount: 1, status: 1, createdAt: 1, _id: 1 }
    ).sort({ createdAt: -1 });

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'UPI transactions retrieved successfully',
      data: userTransactions,
    };
  } catch (e) {
    throw new HttpException(
      {
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: e?.message || 'An error occurred while fetching UPI transactions',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

async getAllUpiTransactions(filter?: { startDate?: Date; endDate?: Date; status?: 'FAILED' | 'SUCCESS' }) {
  try {
    // Build query for filtering
    const query: any = { paymentType: 'upi', isTransaction: true };
    
    // Add date range filter if provided
    if (filter?.startDate || filter?.endDate) {
      query.createdAt = {};
      if (filter.startDate) {
        query.createdAt.$gte = filter.startDate;
      }
      if (filter.endDate) {
        query.createdAt.$lte = filter.endDate;
      }
    }
    
    // Add status filter if provided
    if (filter?.status) {
      query.status = filter.status;
    }

    // Get all UPI transactions with the specified filters
    const transactions = await this.wallet.find(
      query,
      { userId: 1, amount: 1, status: 1, createdAt: 1, _id: 1 }
    ).sort({ createdAt: -1 });

    // Calculate total amount for successful transactions
    const totalAmount = await this.wallet.aggregate([
      { $match: { ...query, status: 'SUCCESS' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const total = totalAmount.length > 0 ? totalAmount[0].total : 0;
    
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'All UPI transactions retrieved successfully',
      data: {
        transactions,
        meta: {
          count: transactions.length,
          totalSuccessAmount: total
        }
      }
    };
  } catch (error) {
    throw new HttpException(
      {
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: error?.message || 'An error occurred while fetching UPI transactions',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}


}
