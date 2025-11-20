import { category } from "src/schema/category.schema";
import { vendorDTO } from "./DTO/vendor.dto";


export interface IVendorService {

    createVendor(data: vendorDTO, fileUrl?: string);
    getVendorById(id: string): Promise<{ success: boolean; message: string }>;
    getAllVendor(page?: number, limit?: number, search?: string): Promise<{ success: boolean; vendor: any[]; total: number; page: number; limit: number }>;
    updateVendor(id: string, updateData: Partial<vendorDTO>, fileUrl?: string): Promise<{ success: boolean; message: string; statusCode: number; data?: any; }>;
    deleteVendor(id: string): Promise<{ success: boolean; message: string; statusCode: number }>;

    
    // updateVendor(id: string, updateData: Partial<vendorDTO>, file?: Express.Multer.File): Promise<{ success: boolean; message: string;  vendor?: vendorDTO }>;
    // deleteVendor(id: string): Promise<{ success: boolean; message: string }>;
    // updateVendorStatus(data: any);
    // vendorList();
    // getAllVendor(page?: number, limit?: number, search?: string, status?: string): Promise<{ success: boolean; enterprise: any[]; total: number; activeCount: number; inactiveCount: number;deletedCount: number;page: number;limit: number;}>
    // getvendorStatus();
}