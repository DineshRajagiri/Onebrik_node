import { CreateAppModuleDto } from "./DTO/create-module.dto";

export interface IPermissionService {
  upsertModule(dto: CreateAppModuleDto): Promise<any>;
  getModules(): Promise<any>;
  deleteModule(id: string): Promise<any>;
  createSubModule(dto: any): Promise<any>;
  getSubModules(moduleId?: any): Promise<any>;
  deleteSubModule(id: string): Promise<any>;
  createSubModuleChild(dto: any): Promise<any>;
  getSubModuleChildren(subModuleId?: any): Promise<any>;
  deleteSubModuleChild(id: string): Promise<any>;
  upsertPermissionsForRole(dto: any): Promise<any>;
  getPermissionsByRole(dto: any): Promise<any>;
  getModuleTree(): Promise<any>;
  getSidebarMenu(): Promise<any>;
  getPaginatedModules(page: number, limit: number): Promise<any>;
}