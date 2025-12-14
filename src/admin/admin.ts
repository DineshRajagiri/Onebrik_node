import { AdminDTO } from "./dto/admin.dto";

export interface IAdminService {
    createAdmin(data: any, files: any);
    getAllAdmin(page?: number, limit?: number, search?: string, status?: string): Promise<{ success: boolean; admin: any[]; total: number; activeCount: number; inactiveCount: number;page: number;limit: number;}>;
    updateAdmin(id: string, updateData: Partial<AdminDTO>, file?: any): Promise<{ success: boolean; message: string; admin?: AdminDTO }>;
    deleteAdmin(id: string): Promise<{ success: boolean; message: string }>;
    updateAdminStatus(data: any);
    getAdminById(id: string): Promise<{ success: boolean; message: string }>;
    updateOwnProfile(id: string, file?: any): Promise<{ success: boolean; message: string; admin?: AdminDTO }>;
    changePassword(adminId:string,oldPassword: string, newPassword: string,confirmPassword:string): Promise<{success: boolean; statusCode: number; message: string; admin?: AdminDTO}>;
    getAdminProfileById(id: string): Promise<{ success: boolean; message: string; adminProfile: string }>;

}