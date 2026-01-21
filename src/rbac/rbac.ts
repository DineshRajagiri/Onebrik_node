import { CreateMenuDto } from "./DTO/create-menu.dto";
import { moduleDTO } from "./DTO/module.dto";
import { subModuleDTO } from "./DTO/subModule.dto";
import { subModuleChildDTO } from "./DTO/subModuleChild.dto";
import { UpdateMenuDto } from "./DTO/update-menu.dto";

export interface IRBACService {
    getMenuForUser(id: string): Promise<any>;
}