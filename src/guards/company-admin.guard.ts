import { ExecutionContext } from '@nestjs/common';

export class companyAdminGuard {
  canActivate(context: ExecutionContext) {
    const user = context.switchToHttp().getRequest().user;
    return user.companyRole === 'ADMIN';
  }
}
