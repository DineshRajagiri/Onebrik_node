import { CanActivate, ExecutionContext } from '@nestjs/common';

export class IsVerifiedGuard implements CanActivate {

  canActivate(context: ExecutionContext): boolean {
    const ctx = context.switchToHttp();
    const request: any = ctx.getRequest<Request>();
    return request.user.isVerifiedByAdmin;
  }
}