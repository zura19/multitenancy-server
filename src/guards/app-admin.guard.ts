import { ExecutionContext } from '@nestjs/common';

export class AppAdminGuard {
  canActivate(context: ExecutionContext) {
    const user = context.switchToHttp().getRequest().user;
    return user.role === 'ADMIN';
  }
}
