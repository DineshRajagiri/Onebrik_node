import { CreateAppModuleDto } from "./DTO/create-module.dto";
import { UpsertModuleDto } from "./DTO/upsert-module.dto";

export interface IPermissionService {

  getPaginatedModules(page: number, limit: number): Promise<any>;
  upsertModule(dto: UpsertModuleDto): Promise<any>;
  getmodulesById(id: string): Promise<any>;
  deleteModule(id: string): Promise<any>;

  getList(data: any): Promise<any>;

  upsertSubModule(dto: any): Promise<any>;
  upsertSubModuleChild(dto: any): Promise<any>;
  getSubModules(moduleId?: any): Promise<any>;
  deleteSubModule(id: string): Promise<any>;
  createSubModuleChild(dto: any): Promise<any>;
  getSubModuleChildren(subModuleId?: any): Promise<any>;
  deleteSubModuleChild(id: string): Promise<any>;
  upsertPermissionsForRole(dto: any): Promise<any>;
  getPermissionsByRole(dto: any): Promise<any>;
  getSidebarForUser(userId: any): Promise<any>;
  getModuleTree(): Promise<any>;
  getSidebarMenu(): Promise<any>;
  getPaginatedModules(page: number, limit: number): Promise<any>;
  givePermissions(data: any): Promise<void>;
  getsidebarForadmin(role): Promise<any>;
}