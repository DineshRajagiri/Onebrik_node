import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Roles } from 'src/utils/constants';

export class isAdminOrSuperAdminGuard implements CanActivate {

  canActivate(context: ExecutionContext): boolean {
    const ctx = context.switchToHttp();
    const request: any = ctx.getRequest<Request>();
    if(request.user.role==Roles.ADMIN||request.user.role==Roles.SUPERADMIN)
    {
        return true
    }
    return false;
  }
}