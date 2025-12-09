// import { CreateUserDto } from "../dto/create-user.dto";
// import { UpdateUserDto } from "../dto/update-user.dto";

import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./DTO/update-user.dto";

export interface IUserService {
  create(dto: CreateUserDto): Promise<any>;
  findAll(page?: number, limit?: number, search?: string): Promise<any>;
  findOne(id: string): Promise<any>;
  update(id: string, dto: Partial<CreateUserDto>): Promise<any>;
  remove(id: string): Promise<any>;
}