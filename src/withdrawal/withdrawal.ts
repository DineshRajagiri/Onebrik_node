import { withdrawalStatus } from "src/utils/constants";
import { withdrawalDTO } from "./dto/withdrawal.dto";

export interface IwithdrawalService {

    createWithdrawal(data: withdrawalDTO): Promise<{ success: boolean; statusCode: number; message: string; withdrawal: { status: string; requestedOn: Date; dateOfTransaction: string | Date; amountRequested: number; }; }>;
    updateWithdrawalStatus(userId: string,  status: withdrawalStatus,remark?: string): Promise<{ success: boolean; statusCode: number; message: string; }>;
    getWithdrawalHistoryByUserId(userId: string): Promise<{ success: boolean; statusCode: number; message: string; withdrawals: { status: string; requestedOn: Date; dateOfTransaction: string | Date; amountRequested: number; }[]; }>;
    getAllWithdrawals(page: number, limit: number): Promise<{ success: boolean; statusCode: number; message: string; withdrawals: { status: string; requestedOn: Date; dateOfTransaction: string | Date; amountRequested: number; }[]; total: number; page: number; limit: number; }>;
    getWithdrawalStatus();

}