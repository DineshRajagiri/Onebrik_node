import { experienceDTO } from "./DTO/experience.dto";
import { incomeRangeDTO } from "./DTO/incomeRange.dto";
import { professionDTO } from "./DTO/profession.dto";
import { relationshipManagerDTO } from "./DTO/realationshipManager.dto";
import { relationshipDTO } from "./DTO/realtionship.dto";
import { roleDTO } from "./DTO/role.dto";
import { xScoreDTO } from "./DTO/xScore.dto";

export interface IMasterService {
     createExperience(collectionName: experienceDTO): Promise<string>;
     createIncomeRange(collectionName: incomeRangeDTO): Promise<string>;
     createProfession(collectionName: professionDTO): Promise<string>;
     createRelationship(collectionName: relationshipDTO): Promise<string>;
     createxScore(collectionName:xScoreDTO):Promise<string>;
     createRelationshipManager(collectionName:relationshipManagerDTO):Promise<string>;
     createRole(collectionName:roleDTO):Promise<string>;
     

     getAllExperience(page?: number, limit?: number,search?:string): Promise<{ success: boolean; experiences: any[]; total: number; page: number; limit: number }>;
     getAllIncomeRange(page?: number, limit?: number,search?:string): Promise<{ success: boolean; incomeRange: any[]; total: number; page: number; limit: number }>;
     getAllProfession(page?: number, limit?: number,search?:string): Promise<{ success: boolean; profession: any[]; total: number; page: number; limit: number }>;
     getAllRelationship(page?: number, limit?: number,search?:string): Promise<{ success: boolean; relationship: any[]; total: number; page: number; limit: number }>;
     getAllxScore(page?: number, limit?: number,search?:string): Promise<{ success: boolean; xScore: any[]; total: number; page: number; limit: number }>;
     getAllRelationshipManager(page?: number, limit?: number,search?:string): Promise<{ success: boolean; realationshipManager: any[]; total: number; page: number; limit: number }>;
     getAllRoles(page?: number, limit?: number,search?:string): Promise<{ success: boolean; role: any[]; total: number; page: number; limit: number }>;

     
     updateExperience(id: string, updateData: experienceDTO): Promise<{ success: boolean; message: string; experiences?: experienceDTO }>;
     updateIncomeRange(id: string, updateData: incomeRangeDTO): Promise<{ success: boolean; message: string; incomeRange?: incomeRangeDTO }>;
     updateProfession(id: string, updateData: professionDTO): Promise<{ success: boolean; message: string; profession?: professionDTO }>;
     updateRelationship(id: string, updateData: relationshipDTO): Promise<{ success: boolean; message: string; relationship?: relationshipDTO }>;
     updatexScore(id: string, updateData: xScoreDTO):Promise<{ success: boolean; message: string; xScore?: xScoreDTO }>;
     updateRelationshipManager(id: string, updateData: relationshipManagerDTO):Promise<{ success: boolean; message: string; relationshipManager?: relationshipManagerDTO }>;
     updateRole(id: string, updateData: roleDTO):Promise<{ success: boolean; message: string; role?: roleDTO }>;


     deleteExperience(id: string): Promise<{ success: boolean; message: string }>;
     deleteIncomeRange(id: string): Promise<{ success: boolean; message: string }>;
     deleteProfession(id: string): Promise<{ success: boolean; message: string }>;
     deleteRelationship(id: string): Promise<{ success: boolean; message: string }>;
     deletexScore(id: string): Promise<{ success: boolean; message: string }>;
     deleteRelationshipManager(id: string): Promise<{ success: boolean; message: string }>;
     deleteRole(id: string): Promise<{ success: boolean; message: string }>;




     getxScoreById(id: string): Promise<{ success: boolean; message: string }>;
     getExperienceById(id: string): Promise<{ success: boolean; message: string }>;
     getIncomeRangeById(id: string): Promise<{ success: boolean; message: string }>;
     getProfessionById(id: string): Promise<{ success: boolean; message: string }>;
     getRelationshipById(id: string): Promise<{ success: boolean; message: string }>;
     getRoleById(id: string): Promise<{ success: boolean; message: string }>;

     xScoreList();


} 