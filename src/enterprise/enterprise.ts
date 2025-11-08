import { enterpriseDTO } from "./DTO/enterprise.dto";

export interface IEnterpriseService {
    createEnterprise(data: any, files: any);
    getAllEnterprise(page?: number,limit?: number,search?: string,status?: string): Promise<{success: boolean;enterprise: any[];total: number;activeCount: number;inactiveCount: number;deletedCount: number;page: number;limit: number;}>;
    updateEnterprise(id: string, updateData: Partial<enterpriseDTO>, file?: any): Promise<{ success: boolean; message: string; enterprise?: enterpriseDTO }>;
    deleteEnterprise(id: string): Promise<{ success: boolean; message: string }>;
    getEnterpriseById(id: string): Promise<{ success: boolean; message: string }>;
    // updateEnterpriseStatus(data: any): Promise<{ success: boolean; message: string }>;
    updateEnterpriseStatus(data: any);
    getEnterpriseStats();
    enterpriseList();
}