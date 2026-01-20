import { CreateMenuDto } from "./dto/create-menu.dto";
import { moduleDTO } from "./dto/module.dto";
import { subModuleDTO } from "./dto/submodule.dto";
import { subModuleChildDTO } from "./dto/subModuleChild.dto";
import { UpdateMenuDto } from "./dto/update-menu.dto";

export interface IRBACService {
    getMenuForUser(id: string): Promise<any>;
}