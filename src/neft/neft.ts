export interface INeftService {
    
    createNeft(data: any, files: any, req: any);
    getNeftTransactionsByUserId(userId: string, page?: number, limit?: number, search?: string, status?: string): Promise<{ success: boolean; neft: any[]; total: number; approvedCount: number; rejectedCount: number; pendingCount: number; page: number; limit: number; }>;
    getNeftStatus();
    updateNeftStatus(id:string,data: any);
    UpdateNeft(id: string,data: any, files: any, req: any);
    getAllNeft(page?: number, limit?: number, search?: string, status?: string): Promise<{ success: boolean; neft: any[]; total: number; approvedCount: number; rejectedCount: number; pendingCount:number; page: number;limit: number;}>;
}