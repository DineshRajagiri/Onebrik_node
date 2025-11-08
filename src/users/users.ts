// import { moduleDTO } from "./dto/module.dto";

import { CreateUserDTO } from "src/auth/DTO/createUser.dto";
import { walletDTO } from "./DTO/wallet.dto";
import { profileImageDTO } from "./DTO/profileImage.dto";
import { NomineeDTO } from "./DTO/nominee.dto";
import { BankDetailsDTO } from "./DTO/bankdetails.dto";


export interface IUsersService {
    addMoneyToWallet(collectionName: walletDTO);
    getWalletBalanceById(userId: string);
    getWalletTransactionHistory(userId: string);
    aadharDetails(data: any);
    panDetails(data: any);
    nomineeDetails(data: any);
    bankDetails(data: any, files: Express.Multer.File);
    otherDetails(data: any);
    getAllUsers(
        page?: number,
        limit?: number,
        search?: string,
        createdAt?: string,
        userStatus?: string,
        fromDate?: string,
        toDate?: string
      ): Promise<{
        success: boolean;
        users: any[];
        total: number;
        page: number;
        limit: number;
      }>;
      
    userProfile(updateData: any, file?: any): Promise<{ success: boolean; message: string; Users?: profileImageDTO }>;
    getUserProfileById(id: string): Promise<{ success: boolean; message: string }>;
    getBankDetailsById(id: string): Promise<{ success: boolean; message: string }>;
    getNomineeDetailsById(id: string): Promise<{ success: boolean; message: string }>;
    getUserById(id: string): Promise<{ success: boolean; message: string }>;
    getUserStats();
    updateUser(userId: string, updateData: any);
    updateNomineeDetails(id: string, updateData: NomineeDTO):Promise<{ success: boolean; message: string; nomineeDetails?: NomineeDTO }>;
    updateBankDetails(id: string, updateData: BankDetailsDTO):Promise<{ success: boolean; message: string; bankDetails?: BankDetailsDTO }>;
    updateUserStatus(data: any);
    deleteUser(id: string): Promise<{ success: boolean; message: string }>;
    getDeletedUsers( page?: number, limit?: number, search?: string, createdAt?: string, userStatus?: string): Promise<{ success: boolean; users: any[]; total: number; page: number; limit: number }>;
    getUserDetailsById(userId: string): Promise<{ success: boolean; user: any }>;
    notifyUsersForUpcomingDeals(): Promise<{ success: boolean; message: string; results?: { userId: string; emailStatus: 'sent' | 'failed'; pushStatus: 'sent' | 'failed'; }[]; error?: any; }>;
    createUpiPayment(data: { userId: string; amount: number; status: 'FAILED' | 'SUCCESS' }, req?: any);
    getTransactionsById(userId: string);

    getAllUpiTransactions(filter?: { startDate?: Date; endDate?: Date; status?: 'FAILED' | 'SUCCESS' }): Promise<any>;
}
   
