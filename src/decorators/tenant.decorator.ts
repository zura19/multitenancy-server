import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const Tenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest() as Request;

    if (request.user && request.user.role !== 'ADMIN') {
      return request.user.companyId;
    }

    return undefined;
  },
);
