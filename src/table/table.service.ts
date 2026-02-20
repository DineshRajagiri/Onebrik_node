import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TableMetadataMap } from 'src/common/table-metadata/table-index';
import { InventoryService } from 'src/inventory/inventory.service';
import { SuperAdminService } from 'src/module/superadmin/superadmin.service';
import { IPermissionService } from 'src/permission/permission';
import { PermissionService } from 'src/permission/permission.service';
import { RoleService } from 'src/role/role.service';
import { Services } from 'src/utils/constants';

@Injectable()
export class TableService {

  constructor(
    // @Inject(Services.PERMISSION) private modulesService: IPermissionService
    // private readonly service: PermissionService,
    private readonly inventoryService: InventoryService,
    private readonly service: PermissionService,
    private readonly roleService: RoleService,
    private readonly superAdminService: SuperAdminService,
  ) { }

  async buildTable(tableKey: string, page: number, limit: number, query?: any) {

    if (page <= 0 || limit <= 0) {
      throw new BadRequestException("Invalid page or limit");
    }

    const metadata = TableMetadataMap[tableKey];
    if (!metadata) {
      throw new NotFoundException(`Metadata not found for ${tableKey}`);
    }

    let result;

    switch (tableKey) {
      case "modules":
        result = await this.service.getPaginatedModules(page, limit);
        break;

      case "submodules":
        result = await this.service.getPaginatedSubModules(page, limit);
        break;

      case "attributes":
        result = await this.inventoryService.getAllAttributes({ page, limit, search: "" });
        break;

      case "attributesValues":
        result = await this.inventoryService.getAllAttributeValues({ page, limit, search: "" });
        break;

      case "inventoryCategory":
        result = await this.inventoryService.getAllInventoryCategories({page,limit,search: query?.search || "",level: query?.level || "",parentId: query?.parentId || ""});
        break;


      case "products":
        result = await this.inventoryService.getAllProducts({ page, limit, search: "" });
        break;

      case "productVarients":
        result = await this.inventoryService.getAllProductVariants({ page, limit, search: "" });
        break;

      case "varientAttributeValues":
        result = await this.inventoryService.getAllVariantAttributeValues({ page, limit, search: "" });
        break;
      case "submodulechild":
        result = await this.service.getPaginatedSubModuleChild(page, limit);
        break;

      case "roles":
        result = await this.roleService.getPaginatedRoles(page, limit);
        break;
      case "users_new":
        result = await this.superAdminService.getusers();
        break;
      default:
        throw new NotFoundException(`No service for table ${tableKey}`);
    }

    return {
      success: true,
      tableName: metadata.tableName,
      columns: metadata.columns,
      actions: metadata.actions,
      data: result.data,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit)
      }
    };
  }
}
