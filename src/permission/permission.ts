import { CreateAppModuleDto } from "./DTO/create-module.dto";
import { UpsertModuleDto } from "./DTO/upsert-module.dto";
import { UpsertSubModuleDto } from "./DTO/upsert-sub-module.dto";
import { UpsertSubModuleChildDto } from "./DTO/upsert-submodule-child-dto";

export interface IPermissionService {

  getPaginatedModules(page: number, limit: number): Promise<any>;
  upsertModule(dto: UpsertModuleDto): Promise<any>;
  getmodulesById(id: string): Promise<any>;
  deleteModule(id: string): Promise<any>;


  getPaginatedSubModules(page: number, limit: number): Promise<{ data: any[]; total: number; page: number; limit: number; }>;
  upsertSubModule(dto: UpsertSubModuleDto): Promise<{ success: boolean; message: string; data: any; }>;
  getSubModuleById(id: string): Promise<{ success: boolean; message: string; data: any; }>;
  deleteSubModule(id: string): Promise<{ success: boolean; message: string; data: null; }>;
  getSubModulesByModuleId(moduleId: string): Promise<{ success: boolean; message: string; data: any[]; }>;


  getPaginatedSubModuleChild(page: number,limit: number): Promise<{data: any[];total: number;page: number;limit: number;}>;
  upsertSubModuleChild(dto: UpsertSubModuleChildDto): Promise<{success: boolean;message: string;data: any;}>;
  getSubModuleChildById(id: string): Promise<{success: boolean;message: string;data: any;}>;
  deleteSubModuleChild(id: string): Promise<{success: boolean;message: string;data: null;}>;
  getSubModuleChildrenBySubModuleId(subModuleId: string): Promise<{success: boolean;message: string;data: any[];}>;



  getList(data: any): Promise<any>;





  upsertPermissionsForRole(dto: any): Promise<any>;
  getPermissionsByRole(dto: any): Promise<any>;
  getSidebarForUser(userId: any): Promise<any>;
  getModuleTree(): Promise<any>;
  getSidebarMenu(): Promise<any>;
  getPaginatedModules(page: number, limit: number): Promise<any>;
  givePermissions(data: any): Promise<void>;
  getsidebarForadmin(role): Promise<any>;
}