import { ModulesTableMetadata } from "./module.table";
import { RolesTableMetadata } from "./role";
import { SubModuleChildTableMetadata } from "./submodulechild";
import { SubModulesTableMetadata } from "./submodules";

export const TableMetadataMap: Record<string, any> = {
  modules: ModulesTableMetadata,
  submodules: SubModulesTableMetadata,
  submodulechild: SubModuleChildTableMetadata,
  roles: RolesTableMetadata
};
