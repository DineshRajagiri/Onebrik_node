import { categoryDTO } from "./dto/category.dto";
import { experienceDTO } from "./dto/experience.dto";
import { incomeRangeDTO } from "./dto/incomeRange.dto";
import { professionDTO } from "./dto/profession.dto";
import { relationshipManagerDTO } from "./dto/realationshipManager.dto";
import { relationshipDTO } from "./dto/realtionship.dto";
import { regionDTO } from "./dto/region.dto";
import { roleDTO } from "./dto/role.dto";
import { xScoreDTO } from "./dto/xScore.dto";

export interface IMasterService {

     //one brik//
     createCategory(data: categoryDTO);
     createRegion(date: regionDTO);

     getAllCategory(page?: number, limit?: number, search?: string): Promise<{ success: boolean; vendor: any[]; total: number; page: number; limit: number }>;
     getAllRegion(page?: number, limit?: number, search?: string): Promise<{ success: boolean; vendor: any[]; total: number; page: number; limit: number }>;


     updateCategory(id: string, updateData: Partial<categoryDTO>): Promise<{ success: boolean; message: string; statusCode: number; data?: any; }>;
     updateRegion(id: string, updateData: Partial<regionDTO>): Promise<{ success: boolean; message: string; statusCode: number; data?: any; }>;

     deleteCategory(id: string): Promise<{ success: boolean; message: string; statusCode: number }>;
     deleteRegion(id: string): Promise<{ success: boolean; message: string; statusCode: number }>;

} 