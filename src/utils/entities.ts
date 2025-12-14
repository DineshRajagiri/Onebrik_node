import { admin, adminSchemaFile } from "src/schema/admin.schema";
import { blogs, blogsSchemaFile } from "src/schema/blogs.schema";
import { category, categorySchemaFile } from "src/schema/category.schema";
import { Counter, CounterSchema } from "src/schema/counter.schema";
import { deals, dealsSchemaFile } from "src/schema/deals.schema";
import { deliveryBoy, deliveryBoySchemaFile } from "src/schema/deliveryBoy.schema";
import { enterprise, enterpriseSchemaFile } from "src/schema/enterprise.schema";
import { experience, experienceSchemaFile } from "src/schema/experience.schema";
import { incomeRange, incomeRangeSchemaFile } from "src/schema/IncomeRange.schema";
import { Menu, MenuSchema } from "src/schema/menu.schema";
import { modules, modulesSchemaFile } from "src/schema/module.schema";
import { neft, neftSchemaFile } from "src/schema/neft.schema";
import { notification, notificationSchemaFile } from "src/schema/notification.schema";
import { notificationToken, notificationTokenSchemaFile } from "src/schema/notificationToken.schema";
import { Permission, PermissionSchema } from "src/schema/permission.schema";
import { region, regionSchemaFile } from "src/schema/region.schema";
import { relationshipManager, relationshipManagerSchemaFile } from "src/schema/relationshipManager";
import { roles, rolesSchemaFile } from "src/schema/role.schema";
import { subModules, subModulesSchemaFile } from "src/schema/subModule.schema";
import { subModuleChild, subModuleChildSchemaFile } from "src/schema/subModuleChild.schema";
import { User, UserSchema } from "src/schema/user.schema";
import { UserProfile, UserProfileSchema } from "src/schema/userProfile.schema";
import { vendor, vendorSchemaFile } from "src/schema/vendor.schema";
import { wallet, walletSchemaFile } from "src/schema/wallet.schema";
import { withdrawal, withdrawalSchemaFile } from "src/schema/withdrawal.schema";




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
    { name: notification.name, schema: notificationSchemaFile },
    { name: wallet.name, schema: walletSchemaFile },
    { name: experience.name, schema: experienceSchemaFile },
    { name: incomeRange.name, schema: incomeRangeSchemaFile },
    { name: enterprise.name, schema: enterpriseSchemaFile },
    { name: vendor.name, schema: vendorSchemaFile },
    { name: Counter.name, schema: CounterSchema },
    { name: deals.name, schema: dealsSchemaFile },
    { name: relationshipManager.name, schema: relationshipManagerSchemaFile },
    { name: neft.name, schema: neftSchemaFile },
    { name: blogs.name, schema: blogsSchemaFile },
    { name: wallet.name, schema: walletSchemaFile },
    { name: withdrawal.name, schema: withdrawalSchemaFile },
    { name: category.name, schema: categorySchemaFile },
    { name: region.name, schema: regionSchemaFile },
    { name: deliveryBoy.name, schema: deliveryBoySchemaFile },


    // { name: PermissionsByAdmin.name,schema:PermissionsByAdminSchema},
    // { name: ModulePermission.name,schema:ModulePermission},
    // { name: SubModulePermission.name,schema:SubModulePermissionSchema},
    // { name: SubModuleChildPermission.name,schema:SubModuleChildPermissionSchema},


]