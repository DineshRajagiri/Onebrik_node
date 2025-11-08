import { dealsDTO } from "./DTO/deals.dto";

export interface IDealsService {
   
    createDeals(data: any, files: any, req: any);
    updateDeals(id: string, updateData: Partial<dealsDTO>, file?: any): Promise<{ success: boolean; message: string; deals?: dealsDTO; }>;
    updateDealStatus(data: any);
    getDealsById(id: string): Promise<{ success: boolean; message: string }>;
    deleteDeals(id: string): Promise<{ success: boolean; message: string }>;
    getDealStatus();
    getAllDeals(page?: number, limit?: number, dealStatus?: string,dealType?: string): Promise<{ success: boolean; deals: any[]; total: number; page: number;limit: number;}>;
    notifyUsersForUpcomingDeals(): Promise<{ success: boolean; message: string; results?: { userId: string; dealId: string; emailStatus: 'sent' | 'failed'; pushStatus: 'sent' | 'failed'; }[]; error?: any; }>;
    dealCalculation(dealId: string, investmentAmount: number): Promise<{ success: boolean; message: string; result?: { investmentAmount: number; maturityAmount: number; interestAmount: number; netYield: number; tdsOnInterest: number; interestAfterTds: number; totalReceivableAmount: number; } }>;
    createDealPurchase(data: any,  req: any): Promise<{ success: boolean; statusCode: number; message: string; purchase?: any }>;
    getDealPurchaseByUserId(userId: string): Promise<{ success: boolean; statusCode: number; message: string; purchases?: any[] }>;

    getAllDealPurchases(page?: number, limit?: number, dealStatus?: string, dealType?: string): Promise<{ success: boolean; statusCode: number; message: string; purchases?: any[]; total?: number; page?: number; limit?: number; }>

}


