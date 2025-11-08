import { HttpException, HttpStatus, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { deals, DealsDocument } from 'src/schema/deals.schema';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { dealsDTO } from './DTO/deals.dto';
import { dealTypes, isDealStatus, isUserStatus, Services } from 'src/utils/constants';
import { INotificationService } from 'src/notification/notification';
import { admin, adminDetails } from 'src/schema/admin.schema';
import { notificationToken, notificationTokenDetails } from 'src/schema/notificationToken.schema';
import { enterprise } from 'src/schema/enterprise.schema';
import { vendor } from 'src/schema/vendor.schema';
import { user } from 'src/schema/user.schema';
import { wallet, walletDetails } from 'src/schema/wallet.schema';
import { Types } from 'mongoose';
export type DealStats = {
  totalDeals: number;
  currentDeals: number;
  upcomingDeals: number;
  pastDeals: number;
  inactiveDeals: number;
};
@Injectable()
export class DealsService {
  private readonly logger = new Logger(DealsService.name);
  constructor(
    @InjectModel(deals.name) private readonly deals: Model<DealsDocument>,
    @InjectModel(admin.name) private readonly admin: Model<adminDetails>,
    @InjectModel(enterprise.name) private readonly enterprise: Model<enterprise>,
    @InjectModel(vendor.name) private readonly vendor: Model<vendor>,
    @InjectModel(notificationToken.name) private readonly notificationToken: Model<notificationTokenDetails>,
    @Inject(Services.NOTIFICATION) private notificationService: INotificationService,
    @InjectModel(user.name) private readonly user: Model<user>,
    @InjectModel(wallet.name) private wallet: Model<walletDetails>,
  ) { }


  @Cron(CronExpression.EVERY_MINUTE)
  async activateUpcomingDeals() {
    this.logger.log('🕒 Cron job started: Checking for upcoming deals...');

    try {
      const currentDate = new Date();
      this.logger.log(`🔍 Current Date: ${currentDate.toISOString()}`);

      const upcomingDeals = await this.deals.find({
        dealStatus: isDealStatus.UPCOMING,
        dealStartDate: { $lte: currentDate },
        dealEndDate: { $gte: currentDate }
      });

      for (const deal of upcomingDeals) {
        const dealStartDate = new Date(deal.dealStartDate);
        this.logger.log(`🕒 Checking deal ${deal._id}`);
        this.logger.log(`🔍 Deal Start Date: ${dealStartDate.toISOString()}`);

        if (dealStartDate > currentDate) {
          this.logger.log(`🚫 Skipping deal ${deal._id}, future start date`);
          continue;
        }

        deal.dealStatus = isDealStatus.CURRENT;
        await deal.save();

        this.logger.log(`✅ Deal Activated: ${deal.dealType} for user ${deal.userId}`);
      }
    } catch (error) {
      this.logger.error('❌ Error activating upcoming deals:', error);
    }
  }


  async createDeals(
    data: dealsDTO,
    fileUrls?: { dealReport: string; enterpriseInvoice: string },
    req?: any
  ) {
    try {
      const createdByAdminId = req.user.userId;

      if (fileUrls?.dealReport) data.dealReport = fileUrls.dealReport;
      if (fileUrls?.enterpriseInvoice) data.enterpriseInvoice = fileUrls.enterpriseInvoice;


      data.purchasedValue = 0;
      data.remainingValue = data.dealValue;

      const savedDeals = await this.deals.create(data);
      if (!savedDeals) {
        throw new HttpException(
          { success: false, message: 'Unable to create deals' },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const dealStartDate = new Date(data.dealStartDate);
      const dealEndDate = new Date(data.expiryDate);
      const repaymentDate = new Date(data.repaymentDate);
      const currentDate = new Date();

      console.log(`🕒 Current Time: ${currentDate.toISOString()}`);
      console.log(`📅 Deal Start Date: ${dealStartDate.toISOString()}`);
      console.log(`📅 Repayment Date: ${repaymentDate.toISOString()}`);

      const tenureDays = Math.ceil((repaymentDate.getTime() - dealStartDate.getTime()) / (1000 * 60 * 60 * 24));
      savedDeals.tenure = `${tenureDays} days`;


      if (dealStartDate > currentDate) {
        console.log("⏳ Deal is UPCOMING");
        savedDeals.dealStatus = isDealStatus.UPCOMING;
      } else if (dealEndDate < currentDate) {
        console.log("⌛ Deal is PAST");
        savedDeals.dealStatus = isDealStatus.PAST;
      } else {
        console.log("🔥 Deal is CURRENT");
        savedDeals.dealStatus = isDealStatus.CURRENT;
        await this.activeDeal(savedDeals._id, createdByAdminId);
      }


      await this.deals.updateOne(
        { _id: savedDeals._id },
        {
          dealStatus: savedDeals.dealStatus,
          tenure: savedDeals.tenure,
          purchasedValue: savedDeals.purchasedValue,
          remainingValue: savedDeals.remainingValue
        }
      );

      return {
        success: true,
        statusCode: HttpStatus.CREATED,
        message: 'Deals created successfully',
        deals: savedDeals,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, statusCode: HttpStatus.BAD_REQUEST, message: error.message || 'An error occurred' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }






  async activeDeal(dealId: string, createdByAdminId: string) {
    const deal = await this.deals.findById(dealId);

    if (deal.dealStatus !== isDealStatus.CURRENT) {
      deal.dealStatus = isDealStatus.CURRENT;
      await deal.save();
      const usersWithTokens = await this.notificationToken.find().lean();

      if (!usersWithTokens.length) {
        console.warn(`🚫 No users found with notification tokens`);
        return;
      }
      for (const user of usersWithTokens) {
        await this.notificationService.sendPush({
          user: user.user.toString(),
          title: '🔥 Deal Activated!',
          body: `Your Deal "${deal.dealType}" is now active! 🎉 
              You can purchase this deal with a minimum amount of ${deal.minimumValue} and a maximum amount of ${deal.maximumValue}. Hurry up! 🚀`,
        });
      }
      await this.notificationService.create({
        userId: createdByAdminId,
        title: '✅ Deal Activated',
        body: `Admin ${createdByAdminId} activated the deal: ${deal.dealType}`,
      });
    }
  }
  async getAllDeals(
    page = 1,
    limit = 10,
    dealStatus = '',
    dealType = ''
  ): Promise<{ success: boolean; deals: any[]; total: number; page: number; limit: number }> {
    try {
      const skip = (Math.max(1, page) - 1) * Math.max(1, limit);
      const searchFilter: Record<string, any> = {};

      if (dealType && !Object.values(dealTypes).includes(dealType as dealTypes)) {
        throw new HttpException({ success: false, message: 'Invalid dealType' }, HttpStatus.BAD_REQUEST);
      }
      if (dealType) searchFilter.dealType = dealType;

      if (dealStatus && !Object.values(isDealStatus).includes(dealStatus as isDealStatus)) {
        throw new HttpException({ success: false, message: 'Invalid dealStatus' }, HttpStatus.BAD_REQUEST);
      }
      if (dealStatus) searchFilter.dealStatus = dealStatus;

      console.log('Search Filter:', searchFilter);

      const [deals, total] = await Promise.all([
        this.deals
          .find(searchFilter)
          .skip(skip)
          .limit(limit)
          .populate({
            path: 'enterpriseId',
            model: this.enterprise,
            select: 'enterpriseName uploadLogo',
          })
          .populate({
            path: 'vendorId',
            model: this.vendor,
            select: '_id vendorId',
          })
          .lean(),
        this.deals.countDocuments(searchFilter),
      ]);


      const formattedDeals = deals.map((deal) => {
        const enterprise = typeof deal.enterpriseId === 'object' && deal.enterpriseId !== null
          ? (deal.enterpriseId as { _id: string; enterpriseName?: string; uploadLogo?: string })
          : null;

        const vendor = typeof deal.vendorId === 'object' && deal.vendorId !== null
          ? (deal.vendorId as { _id: string; vendorId?: string })
          : null;

        return {
          ...deal,
          enterpriseId: enterprise?._id || deal.enterpriseId,
          enterpriseName: enterprise?.enterpriseName || null,
          enterpriseLogo: enterprise?.uploadLogo || null,
          vendorId: vendor?._id || deal.vendorId,
          vendorUniqueId: vendor?.vendorId || null,
          dealStatus: deal.dealStatus || 'N/A',
          dealValue: deal.dealValue,
          purchasedValue: deal.purchasedValue || 0,
          remainingValue: deal.dealValue - (deal.purchasedValue || 0),
        };
      });

      return {
        success: true,
        deals: formattedDeals,
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error fetching deals:', error);
      throw new HttpException(
        { success: false, message: error.message || 'Failed to fetch deals' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }







  async updateDeals(
    id: string,
    updateData: Partial<dealsDTO>,
    files?: { dealReport?: any; enterpriseInvoice?: any }
  ): Promise<{ success: boolean; message: string; deals?: dealsDTO }> {
    try {
      const deals = await this.deals.findById(id);
      console.log('Update Data:', updateData);

      if (!deals) {
        throw new NotFoundException(`Deal with ID ${id} not found`);
      }
      // const uploadLogoPath = files?.uploadLogo ? files.uploadLogo : deals.uploadLogo;
      const dealReportPath = files?.dealReport ? files.dealReport : deals.dealReport;
      const enterpriseInvoicePath = files?.enterpriseInvoice ? files.enterpriseInvoice : deals.enterpriseInvoice;
      const updatedDeal = await this.deals.findByIdAndUpdate(
        id,
        {
          ...updateData,
          // uploadLogo: uploadLogoPath, 
          dealReport: dealReportPath,
          enterpriseInvoice: enterpriseInvoicePath
        },
        { new: true }
      );

      if (!updatedDeal) {
        throw new HttpException(
          { success: false, message: 'Failed to update deal' },
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      return {
        success: true,
        message: 'Deal updated successfully',
        deals: updatedDeal,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message || 'Update failed' },
        HttpStatus.BAD_REQUEST
      );
    }
  }
  async updateDealStatus(data: any) {
    try {
      const deal = await this.deals.findById(data?.userId);

      if (!deal) {
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Deal not found',
        };
      }

      const updatedUser = await this.deals.findByIdAndUpdate(
        data?.userId,
        {
          $set: {
            dealStatus: data.status
          },
        },
        { new: true }
      );

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Deals status added successfully',
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
  async getDealsById(id: string): Promise<{ success: boolean; deals: any }> {
    try {
      const deal = await this.deals
        .findById(id)
        .populate({
          path: 'enterpriseId',
          model: this.enterprise,
          select: 'enterpriseName uploadLogo',
        })
        .populate({
          path: 'vendorId',
          model: this.vendor,
          select: '_id vendorId',
        })
        .lean();

      if (!deal) {
        throw new HttpException(
          { success: false, message: 'Deal not found' },
          HttpStatus.NOT_FOUND
        );
      }

      // Ensure the populated fields are treated as objects
      const enterprise = typeof deal.enterpriseId === 'object' && deal.enterpriseId !== null
        ? (deal.enterpriseId as { _id: string; enterpriseName?: string; uploadLogo?: string })
        : null;

      const vendor = typeof deal.vendorId === 'object' && deal.vendorId !== null
        ? (deal.vendorId as { _id: string; vendorId?: string })
        : null;

      const formattedDeal = {
        ...deal,
        enterpriseId: enterprise?._id || deal.enterpriseId, // Keep ID as fallback
        enterpriseName: enterprise?.enterpriseName || null,
        enterpriseLogo: enterprise?.uploadLogo || null,
        vendorId: vendor?._id || deal.vendorId, // Keep ID as fallback
        vendorUniqueId: vendor?.vendorId || null,
      };

      return {
        success: true,
        deals: formattedDeal,
      };
    } catch (error) {
      console.error('Error fetching deal by ID:', error);
      throw new HttpException(
        { success: false, message: error.message || 'Failed to fetch deal details' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  async deleteDeals(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const deletedDeal = await this.deals.findByIdAndDelete(id);

      if (!deletedDeal) {
        throw new HttpException(
          { success: false, message: 'Deal not found' },
          HttpStatus.NOT_FOUND
        );
      }

      return {
        success: true,
        message: 'Deal deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message || 'Failed to delete deal' },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  //dashboard

  async getDealStatus(): Promise<{
    success: boolean;
    message: string;
    shortTermStats: DealStats;
    strategicStats: DealStats;
  }> {
    try {
      const dealTypes = ['ShortTerm', 'Strategic'];

      const getStats = async (type: string) => {
        const total = await this.deals.countDocuments({ dealType: type });
        const current = await this.deals.countDocuments({ dealType: type, dealStatus: 'Active' });
        const upcoming = await this.deals.countDocuments({ dealType: type, dealStatus: 'Future' });
        const past = await this.deals.countDocuments({ dealType: type, dealStatus: 'Closed' });
        const inactive = await this.deals.countDocuments({ dealType: type, dealStatus: 'Inactive' });

        return {
          totalDeals: total,
          currentDeals: current,
          upcomingDeals: upcoming,
          pastDeals: past,
          inactiveDeals: inactive,
        };
      };
      const [shortTermStats, strategicStats] = await Promise.all([
        getStats('ShortTerm'),
        getStats('Strategic'),
      ]);

      return {
        success: true,
        message: 'Deal stats fetched successfully.',
        shortTermStats,
        strategicStats,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch deal stats.',
        shortTermStats: {
          totalDeals: 0,
          currentDeals: 0,
          upcomingDeals: 0,
          pastDeals: 0,
          inactiveDeals: 0,
        },
        strategicStats: {
          totalDeals: 0,
          currentDeals: 0,
          upcomingDeals: 0,
          pastDeals: 0,
          inactiveDeals: 0,
        },
      };
    }
  }


  async dealCalculation(
    dealId: string,
    investmentAmount: number
  ): Promise<{
    success: boolean;
    message: string;
    result?: {
      investmentAmount: number;
      maturityAmount: number;
      interestAmount: number;
      netYield: number;
      tdsOnInterest: number;
      totalReceivableAmount: number;
      tenureDays: number;
    };
  }> {
    try {
      const deal = await this.deals.findById(dealId);
  
      if (!deal) {
        throw new HttpException(
          { success: false, message: 'Deal not found' },
          HttpStatus.NOT_FOUND
        );
      }
  
      const truncate = (num: number, digits: number) => {
        const factor = Math.pow(10, digits);
        return Math.floor(num * factor) / factor;
      };
  
      investmentAmount = Number(investmentAmount);
  
      const { netYield, tenure } = deal;
      const tenureDays = parseInt(tenure.split(' ')[0]);
  
      const interestAmount = truncate(investmentAmount * (netYield / 100) * (tenureDays / 365), 2);
      const tdsOnInterest = truncate(interestAmount * 0.10, 2);
      const interestAfterTds = truncate(interestAmount - tdsOnInterest, 2);
      const maturityAmount = truncate(investmentAmount + interestAmount, 2);
      const totalReceivableAmount = truncate(investmentAmount + interestAfterTds, 2);
  
      return {
        success: true,
        message: 'Deal calculation successful',
        result: {
          investmentAmount,
          netYield,
          tenureDays,
          interestAmount,
          maturityAmount,
          tdsOnInterest,
          totalReceivableAmount,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'An error occurred during deal calculation',
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async createDealPurchase(
    data: any,
    req: any,
  ): Promise<{ success: boolean; statusCode: number; message: string; purchase?: any }> {
    try {
      const {
        dealId,
        userId,
        purchasedAmount,
        dateOfPurchase,
      } = data;
  
      if (!dealId || !userId || !purchasedAmount || !dateOfPurchase) {
        return {
          success: false,
          statusCode: 400,
          message: 'Required fields are missing.',
        };
      }
  
      const user = await this.user.findOne({ _id: userId });
      if (!user) {
        return {
          success: false,
          statusCode: 404,
          message: 'User not found.',
        };
      }
  
      if (user.userStatus === isUserStatus.PENDING) {
        return {
          success: false,
          statusCode: 403,
          message: 'Your account is under review. Please wait for approval to purchase deals.',
        };
      }
  
      if (user.userStatus === isUserStatus.REJECTED) {
        return {
          success: false,
          statusCode: 403,
          message: 'Your account has been rejected. You cannot purchase deals.',
        };
      }
  
      if (user.userStatus !== isUserStatus.APPROVED) {
        return {
          success: false,
          statusCode: 403,
          message: 'Only approved users are allowed to purchase deals.',
        };
      }
  
      const dealCalcResult = await this.dealCalculation(dealId, purchasedAmount);
      if (!dealCalcResult.success || !dealCalcResult.result) {
        return {
          success: false,
          statusCode: 400,
          message: 'Failed to calculate deal values.',
        };
      }
  
      const {
        interestAmount,
        tdsOnInterest,
        maturityAmount,
        totalReceivableAmount,
      } = dealCalcResult.result;
  
      const existingWallet = await this.wallet.findOne({ userId, isTransaction: false });
      const currentBalance = existingWallet?.walletBalance || 0;
  
      if (currentBalance < purchasedAmount) {
        return {
          success: false,
          statusCode: 400,
          message: 'Insufficient wallet balance to purchase the deal.',
        };
      }
  
      await this.wallet.findOneAndUpdate(
        { userId, isTransaction: false },
        {
          $inc: {
            walletBalance: -purchasedAmount,
            investedAmount: purchasedAmount,
            gainedAmount: interestAmount,
          },
          $setOnInsert: {
            transactions: [],
            isTransaction: false,
          },
        },
        { upsert: true, new: true }
      );
  
      const purchaseData = {
        dealId,
        userId,
        purchasedAmount,
        dateOfPurchase,
        interestAmount,
        tdsOnInterest,
        maturityAmount,
        totalReceivableAmount,
        type: 'purchase', 
      };
      
  
      const newPurchase = new this.deals(purchaseData);
      const savedPurchase = await newPurchase.save();
  
      if (!savedPurchase) {
        return {
          success: false,
          statusCode: 500,
          message: 'Failed to create purchase record.',
        };
      }
  
      return {
        success: true,
        statusCode: 200,
        message: 'Deal purchase successfully recorded.',
        purchase: {
          dealId: savedPurchase.dealId,
          userId: savedPurchase.userId,
          purchasedAmount: savedPurchase.purchasedAmount,
          dateOfPurchase: savedPurchase.dateOfPurchase,
          interestAmount: savedPurchase.interestAmount,
          tdsOnInterest: savedPurchase.tdsOnInterest,
          maturityAmount: savedPurchase.maturityAmount,
          totalReceivableAmount: savedPurchase.totalReceivableAmount,
        },
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 500,
        message: error.message || 'An error occurred while creating the deal purchase.',
      };
    }
  }  
  async getDealPurchaseByUserId(userId: string): Promise<{
    success: boolean;
    statusCode: number;
    message: string;
    purchases?: any[];
  }> {
    try {
      if (!userId) {
        return {
          success: false,
          statusCode: 400,
          message: 'User ID is required.',
        };
      }
  
      const userPurchases = await this.deals.find({
        userId,
        purchasedAmount: { $exists: true, $ne: null },
      });
  
      if (!userPurchases.length) {
        return {
          success: false,
          statusCode: 404,
          message: 'No purchases found for this user.',
        };
      }
  
      const enrichedPurchases = await Promise.all(
        userPurchases.map(async (purchase) => {
          const deal = await this.deals.findOne({ _id: purchase.dealId });
          let enterpriseName: string | null = null;
          let vendorCode: string | null = null;
  
          if (deal) {

            const enterprise = await this.enterprise.findOne({ _id: deal.enterpriseId });
            if (enterprise) {
              enterpriseName = enterprise.enterpriseName;
            }
            const vendor = await this.vendor.findOne({ _id: deal.vendorId });
            if (vendor) {
              vendorCode = vendor.vendorId;
            }
          }
  
          return {
            dealId: purchase.dealId,
            userId: purchase.userId,
            purchasedAmount: purchase.purchasedAmount,
            dateOfPurchase: purchase.dateOfPurchase,
            interestAmount: purchase.interestAmount,
            tdsOnInterest: purchase.tdsOnInterest,
            maturityAmount: purchase.maturityAmount,
            totalReceivableAmount: purchase.totalReceivableAmount,
            vendorId: vendorCode,
            enterpriseName,
          };
        })
      );
  
      return {
        success: true,
        statusCode: 200,
        message: 'Purchases fetched successfully.',
        purchases: enrichedPurchases,
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 500,
        message: error.message || 'An error occurred while fetching purchases.',
      };
    }
  }
  
  // async getAllDealPurchases(): Promise<{
  //   success: boolean;
  //   statusCode: number;
  //   message: string;
  //   purchases?: any[];
  // }> {
  //   try {
  //     const allPurchases = await this.deals.find({
  //       purchasedAmount: { $exists: true, $ne: null },
  //     });
  
  //     if (!allPurchases.length) {
  //       return {
  //         success: false,
  //         statusCode: 404,
  //         message: 'No purchases found.',
  //       };
  //     }
  
  //     const enrichedPurchases = await Promise.all(
  //       allPurchases.map(async (purchase) => {
  //         const deal = await this.deals.findOne({ _id: purchase.dealId });
  //         let enterpriseName: string | null = null;
  //         let vendorCode: string | null = null;
  
  //         if (deal) {
  //           const enterprise = await this.enterprise.findOne({ _id: deal.enterpriseId });
  //           if (enterprise) {
  //             enterpriseName = enterprise.enterpriseName;
  //           }
  //           const vendor = await this.vendor.findOne({ _id: deal.vendorId });
  //           if (vendor) {
  //             vendorCode = vendor.vendorId;
  //           }
  //         }
  
  //         return {
  //           dealId: purchase.dealId,
  //           userId: purchase.userId,
  //           purchasedAmount: purchase.purchasedAmount,
  //           dateOfPurchase: purchase.dateOfPurchase,
  //           interestAmount: purchase.interestAmount,
  //           tdsOnInterest: purchase.tdsOnInterest,
  //           maturityAmount: purchase.maturityAmount,
  //           totalReceivableAmount: purchase.totalReceivableAmount,
  //           vendorId: vendorCode,
  //           enterpriseName,
  //         };
  //       })
  //     );
  
  //     return {
  //       success: true,
  //       statusCode: 200,
  //       message: 'All deal purchases fetched successfully.',
  //       purchases: enrichedPurchases,
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       statusCode: 500,
  //       message: error.message || 'An error occurred while fetching all deal purchases.',
  //     };
  //   }
  // }
  
  
  async getAllDealPurchases(): Promise<{
    success: boolean;
    statusCode: number;
    message: string;
    purchases?: any[];
  }> {
    try {
      const allPurchases = await this.deals.find({
        purchasedAmount: { $exists: true, $ne: null },
      });
  
      if (!allPurchases.length) {
        return {
          success: false,
          statusCode: 404,
          message: 'No purchases found.',
        };
      }
  
      const enrichedPurchases = await Promise.all(
        allPurchases.map(async (purchase) => {
          const deal = await this.deals.findOne({ _id: purchase.dealId });
          let enterpriseName: string | null = null;
          let vendorCode: string | null = null;
          let tenure: number = 0; 
  
          if (deal) {
            const enterprise = await this.enterprise.findOne({ _id: deal.enterpriseId });
            if (enterprise) {
              enterpriseName = enterprise.enterpriseName;
            }
            const vendor = await this.vendor.findOne({ _id: deal.vendorId });
            if (vendor) {
              vendorCode = vendor.vendorId;
            }
            if (deal.tenure && typeof deal.tenure === 'string') {
              const match = deal.tenure.match(/(\d+)/); 
              if (match) {
                tenure = parseInt(match[0], 10); 
              }
            }
          }
  
          return {
            dealId: purchase.dealId,
            userId: purchase.userId,
            purchasedAmount: purchase.purchasedAmount,
            dateOfPurchase: purchase.dateOfPurchase,
            interestAmount: purchase.interestAmount,
            tdsOnInterest: purchase.tdsOnInterest,
            maturityAmount: purchase.maturityAmount,
            totalReceivableAmount: purchase.totalReceivableAmount,
            vendorId: vendorCode,
            enterpriseName,
            tenure,
          };
        })
      );
  
      return {
        success: true,
        statusCode: 200,
        message: 'All deal purchases fetched successfully.',
        purchases: enrichedPurchases,
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 500,
        message: error.message || 'An error occurred while fetching all deal purchases.',
      };
    }
  }
  
  
  

  




  
}