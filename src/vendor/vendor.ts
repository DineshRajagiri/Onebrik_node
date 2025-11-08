import { vendorDTO } from "./DTO/vendor.dto";

export interface IVendorService{
    createVendor(data: any, files: any);
    // getAllVendor(page?: number, limit?: number,search?:string): Promise<{ success: boolean; vendor: any[]; total: number; page: number; limit: number }>;
    getAllVendor(page?: number, limit?: number, search?: string, status?: string): Promise<{ success: boolean; enterprise: any[]; total: number; activeCount: number; inactiveCount: number;deletedCount: number;page: number;limit: number;}>;
    updateVendor(id: string, updateData: Partial<vendorDTO>, file?: Express.Multer.File): Promise<{ success: boolean; message: string;  vendor?: vendorDTO }>;
    deleteVendor(id: string): Promise<{ success: boolean; message: string }>;
    updateVendorStatus(data: any);
    vendorList();
    getVendorById(id: string): Promise<{ success: boolean; message: string }>;
    getvendorStatus();
}