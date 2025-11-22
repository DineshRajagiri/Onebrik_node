import { moduleDTO } from "./DTO/module.dto";
import { subModuleDTO } from "./DTO/submodule.dto";
import { subModuleChildDTO } from "./DTO/subModuleChild.dto";

export interface IRBACService {
    createModule(collectionName: moduleDTO): Promise<string>;
    createSubModule(collectionName: subModuleDTO): Promise<string>;
    createSubModuleChild(collectionName: subModuleChildDTO): Promise<string>;
}