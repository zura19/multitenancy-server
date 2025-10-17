import { Injectable, NestMiddleware, UseGuards } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      user?: Prisma.UserCreateInput & { companyId: string };
    }
  }
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.headers['tenant-id'] as string;
    if (tenantId) req.tenantId = tenantId;

    next();
  }
}
