
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";

export interface IRoleService {
  create(dto: CreateRoleDto): Promise<any>;
  getPaginatedRoles(page?: number, limit?: number, search?: string): Promise<any>;
  findOne(id: string): Promise<any>;
  update(id: string, dto: UpdateRoleDto): Promise<any>;
  remove(id: string): Promise<any>;
  upsertRole(dto: CreateRoleDto): Promise<any>;
}