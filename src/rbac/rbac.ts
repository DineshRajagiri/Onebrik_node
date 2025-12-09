import { CreateMenuDto } from "./dto/create-menu.dto";
import { moduleDTO } from "./DTO/module.dto";
import { subModuleDTO } from "./DTO/submodule.dto";
import { subModuleChildDTO } from "./DTO/subModuleChild.dto";
import { UpdateMenuDto } from "./dto/update-menu.dto";

export interface IRBACService {
    getMenuForUser(id: string): Promise<any>;
}