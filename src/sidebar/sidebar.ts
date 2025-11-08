import { moduleDTO } from "./dto/module.dto";
// import { permissionDTO } from "./DTO/permission.dto";
import { roleDTO } from "./DTO/role.dto";
import { subModuleDTO } from "./DTO/subModule.dto";
import { subModuleChildDTO } from "./DTO/subModuleChild.dto";


export interface ISidebarService {
    createModules(collectionName: moduleDTO): Promise<string>;
    createsubmodules(collectionName: subModuleDTO): Promise<string>;
    createsubmoduleChild(collectionName: subModuleChildDTO): Promise<string>;
    // createPermission(collectionName: permissionDTO): Promise<string>;
    createRoles(collectionName: roleDTO): Promise<string>;
    assignPermissions(data: any)

    modulesList();

    getSidebarForAdmin(userId: string): Promise<{ success: boolean; message: string; sidebar: any }>;

    getAllModules(page?: number, limit?: number, search?: string): Promise<{ success: boolean; modules: any[]; total: number; page: number; limit: number }>;
    getAllSubModules(page?: number, limit?: number, search?: string): Promise<{ success: boolean; Submodules: any[]; total: number; page: number; limit: number }>;
    getAllSubChildModules(page?: number, limit?: number, search?: string): Promise<{ success: boolean; submodulesChild: any[]; total: number; page: number; limit: number }>;
    // getAllPermissions(page?: number, limit?: number, search?: string): Promise<{ success: boolean; permissions: permissionDTO[]; total: number; page: number; limit: number }>;
    getAllRoles(page?: number, limit?: number, search?: string): Promise<{ success: boolean; roles: roleDTO[]; total: number; page: number; limit: number }>;
    

    getAllModulesWithDefaultPermissions();

    updateModule(id: string, updateData: moduleDTO): Promise<{ success: boolean; message: string; module?: moduleDTO }>;
    updateSubModule(id: string, updateData: subModuleDTO): Promise<{ success: boolean; message: string; subModule?: subModuleDTO }>;
    updateSubModuleChild(id: string, updateData: subModuleChildDTO): Promise<{ success: boolean; message: string; subModuleChild?: subModuleChildDTO }>;
    // updatePermission(id: string, updateData: permissionDTO): Promise<{ success: boolean; message: string; permission?: permissionDTO }>;
    updateRole(id: string, updateData: Partial<roleDTO>): Promise<{ success: boolean; message: string; role?: roleDTO }>;

    deleteModule(id: string): Promise<{ success: boolean; message: string }>;
    deleteSubModule(id: string): Promise<{ success: boolean; message: string }>;
    deleteSubModuleChild(id: string): Promise<{ success: boolean; message: string }>;
    deletePermission(id: string): Promise<{ success: boolean; message: string }>;
    deleteRole(id: string): Promise<{ success: boolean; message: string }>;

    getModuleById(id: string): Promise<{ success: boolean; message: string }>;
    getSubModuleById(id: string): Promise<{ success: boolean; message: string }>;
    getSubModuleChildById(id: string): Promise<{ success: boolean; message: string }>;
    getPermissionById(id: string): Promise<{ success: boolean; message: string }>;
    getRoleById(id: string): Promise<{ success: boolean; message: string }>;
}
