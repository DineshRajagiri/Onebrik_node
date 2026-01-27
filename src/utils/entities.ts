import { admin, adminSchemaFile } from "src/schema/admin.schema";
import { attributes, attributesSchemaFile } from "src/schema/attributes.schema";
import { attributesValues, attributesValuesSchemaFile } from "src/schema/attributesValues.schema";
import { category, categorySchemaFile } from "src/schema/category.schema";
import { Counter, CounterSchema } from "src/schema/counter.schema";
import { deliveryBoy, deliveryBoySchemaFile } from "src/schema/deliveryBoy.schema";
import { enterprise, enterpriseSchemaFile } from "src/schema/enterprise.schema";
import { inventoryCategory, inventoryCategorySchemaFile } from "src/schema/inventoryCategory.schema";
import { Menu, MenuSchema } from "src/schema/menu.schema";
import { modules, modulesSchemaFile } from "src/schema/module.schema";
import { notificationToken, notificationTokenSchemaFile } from "src/schema/notificationToken.schema";
// import { Permission, permissionSchemaFile } from "src/schema/permission.schema";
import { Product, ProductSchema } from "src/schema/products.schema";
import { productVariants, productVariantsSchemaFile } from "src/schema/productVariants.schema";
import { Permission, PermissionSchema } from "src/schema/permission.schema";
import { region, regionSchemaFile } from "src/schema/region.schema";
import { roles, rolesSchemaFile } from "src/schema/role.schema";
import { subModules, subModulesSchemaFile } from "src/schema/subModule.schema";
import { subModuleChild, subModuleChildSchemaFile } from "src/schema/subModuleChild.schema";
import { User, UserSchema } from "src/schema/user.schema";
import { UserProfile, UserProfileSchema } from "src/schema/userProfile.schema";
import { VariantAttributeValues, VariantAttributeValuesSchemaFile } from "src/schema/variantAttributeValues.schema";
import { VariantImages, VariantImagesSchemaFile } from "src/schema/variantImages.schema";
import { vendor, vendorSchemaFile } from "src/schema/vendor.schema";





export const entities = [
    { name: Menu.name, schema: MenuSchema },
    { name: User.name, schema: UserSchema },
    { name: admin.name, schema: adminSchemaFile },
    { name: UserProfile.name, schema: UserProfileSchema },
    { name: modules.name, schema: modulesSchemaFile },
    { name: subModules.name, schema: subModulesSchemaFile },
    { name: subModuleChild.name, schema: subModuleChildSchemaFile },
    { name: Permission.name, schema: PermissionSchema },
    { name: roles.name, schema: rolesSchemaFile },
    { name: notificationToken.name, schema: notificationTokenSchemaFile },
    { name: enterprise.name, schema: enterpriseSchemaFile },
    { name: vendor.name, schema: vendorSchemaFile },
    { name: Counter.name, schema: CounterSchema },
    { name: category.name, schema: categorySchemaFile },
    { name: region.name, schema: regionSchemaFile },
    { name: deliveryBoy.name, schema: deliveryBoySchemaFile },

    { name: attributes.name, schema: attributesSchemaFile },
    { name: attributesValues.name, schema: attributesValuesSchemaFile },
    { name: inventoryCategory.name, schema: inventoryCategorySchemaFile },

    { name: VariantAttributeValues.name, schema: VariantAttributeValuesSchemaFile },
    { name: VariantImages.name, schema: VariantImagesSchemaFile },
   { name: Product.name, schema: ProductSchema },
    { name: productVariants.name, schema: productVariantsSchemaFile }
    // { name: PermissionsByAdmin.name,schema:PermissionsByAdminSchema},
    // { name: ModulePermission.name,schema:ModulePermission},
    // { name: SubModulePermission.name,schema:SubModulePermissionSchema},
    // { name: SubModuleChildPermission.name,schema:SubModuleChildPermissionSchema},


]