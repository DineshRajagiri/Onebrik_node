import { attributesTableMetadata } from "./attributes";
import { attributesValuesTableMetadata } from "./attributesvalues";
import { inventoryCategoryTableMetadata } from "./inventoryCategory";
import { ModulesTableMetadata } from "./module.table";
import { productsTableMetadata } from "./products";
import { productVarientsTableMetadata } from "./productvariants";
import { SubModulesTableMetadata } from "./submodules";
import { varientAttributeValuesTableMetadata } from "./variantattributevalues";

export const TableMetadataMap: Record<string, any> = {
  modules: ModulesTableMetadata,
  submodules: SubModulesTableMetadata,
  attributes: attributesTableMetadata,
  attributesValues: attributesValuesTableMetadata,
  inventoryCategory: inventoryCategoryTableMetadata,
  products: productsTableMetadata,
  productVarients: productVarientsTableMetadata,
  varientAttributeValues: varientAttributeValuesTableMetadata
};
