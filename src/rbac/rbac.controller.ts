import { Body, Controller, Inject, Post, Get, Param, Put, Delete, Query } from '@nestjs/common';
import { Services } from 'src/utils/constants';
import { IRBACService } from './rbac';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { ListMenuDto } from './dto/list-menu.dto';
import { Public } from 'src/decorators/public.decorator';
import { BaseResponse } from 'src/common/DTO/base-response.dto';

@Controller('sidebar')
export class RbacController {
  constructor(
    @Inject(Services.RBAC) private rbacService: IRBACService,
  ) { }

  @Public()
  @Get('super-admin')
  getSuperAdminSidebar() {
    return {
      success: true,
      data: {
        menus: [
          {
            id: 'Dashboard',
            title: 'Dashboard',
            type: 'group',
            children: [
              {
                id: 'dashboard',
                title: 'Dashboard',
                url: '/admin/dashboard',
                type: 'item',
                routeType: 'custom'   // <-- CUSTOM PAGE
              }
            ]
          },

          {
            id: 'masters',
            title: 'Masters',
            type: 'group',
            children: [
              {
                id: 'menu',
                title: 'Menu',
                type: 'collapse',
                children: [
                  {
                    id: 'modules',
                    title: 'Modules',
                    type: 'item',
                    tableKey: 'modules',
                    routeType: 'master',   // <-- MASTER PAGE
                    url: '/admin/masters/modules'
                  },
                  {
                    id: 'submodules',
                    title: 'Sub Module',
                    type: 'item',
                    tableKey: 'submodules',
                    routeType: 'master',   // <-- MASTER PAGE
                    url: '/admin/masters/submodules'
                  },
                  {
                    id: 'submodulechild',
                    title: 'Sub Module Child',
                    type: 'item',
                    tableKey: 'submodulechild',
                    routeType: 'master',   // <-- MASTER PAGE
                    url: '/admin/masters/submodulechild'
                  }
                ]
              }
            ]
          },

          {
            id: 'users',
            title: 'Users',
            type: 'group',
            children: [
              {
                id: 'user_mgmt',
                title: 'User Management',
                type: 'collapse',
                children: [
                  {
                    id: 'roles',
                    title: 'Roles',
                    type: 'item',
                    tableKey: 'roles',
                    routeType: 'master',   // <-- MASTER PAGE
                    url: '/admin/masters/roles'
                  },
                  {
                    id: 'access-permission',
                    title: 'User Roles Menu',
                    type: 'item',
                    routeType: 'custom',   // <-- CUSTOM PAGE
                    url: '/admin/access-permission'
                  },
                  {
                    id: 'users_new',
                    title: 'Users',
                    type: 'item',
                    tableKey: 'users_new',
                    routeType: 'master',   // <-- MASTER PAGE
                    url: '/admin/masters/users_new'
                  }
                ]
              }
            ]
          },
          {
            id: 'inventory',
            title: 'Inventory',
            type: 'group',
            children: [
              {
                id: 'productManagement',
                title: 'Product Management',
                type: 'collapse',
                children: [
                  {
                    id: 'products',
                    title: 'Product List',
                    type: 'item',
                    tableKey: 'products',
                    routeType: 'master',   // <-- MASTER PAGE
                    url: '/admin/inventory/prdocutList'
                  },
                  {
                    id: 'productUpload',
                    title: 'product Upload',
                    type: 'item',
                    routeType: 'custom',
                    url: '/admin/add-full-product'
                  }

                ]
              },
              {
                id: 'commonManagement',
                title: 'Common Masters',
                type: 'collapse',
                children: [
                  {
                    id: 'attributes',
                    title: 'Attributes List',
                    type: 'item',
                    tableKey: 'attributes',
                    routeType: 'master',
                    url: '/admin/inventory/attributes'
                  },
                  {
                    id: 'attributesValues',
                    title: 'Attributes Values List',
                    type: 'item',
                    tableKey: 'attributesValues',
                    routeType: 'master',
                    url: '/admin/inventory/attributesValues'
                  },
                  {
                    id: 'inventoryCategory',
                    title: 'Inventory Category List',
                    type: 'item',
                    tableKey: 'inventoryCategory',
                    routeType: 'master',
                    url: '/admin/inventory/inventoryCategory'
                  },
                  {
                    id: 'productVarients',
                    title: 'productVarients List',
                    type: 'item',
                    tableKey: 'productVarients',
                    routeType: 'master',
                    url: '/admin/inventory/productVarients'
                  },
                 

                ]
              }
            ],


          }
        ]
      }
    };
  }



}
