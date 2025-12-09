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
              type: 'item'
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
                  url: '/admin/masters/modules',
                  tableKey: 'modules'
                },
                {
                  id: 'submodules',
                  title: 'Sub Module',
                  type: 'item',
                  url: '/admin/masters/submodule',
                  tableKey: 'submodules'
                },
                {
                  id: 'submodule_child',
                  title: 'Sub Module Child',
                  type: 'item',
                  url: '/admin/masters/submodule_child',
                  tableKey: 'submodule_child'
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
                  url: '/admin/masters/roles',
                  type: 'item',
                  tableKey: 'roles'
                },
                {
                  id: 'users_new',
                  title: 'Users',
                  url: '/admin/masters/users_new',
                  type: 'item',
                  tableKey: 'users_new'
                }
              ]
            }
          ]
        }
      ]
    }
  };
}


}
