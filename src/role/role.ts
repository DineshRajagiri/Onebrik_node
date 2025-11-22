import { AssignPermissionDTO } from "./DTO/assign-permission.dto";
import { CreateRoleDTO } from "./DTO/role.dto";

export interface IRoleService {
    createRole(collectionName: CreateRoleDTO): Promise<string>;
    assignPermissions(collectionName: AssignPermissionDTO): Promise<string>;
}