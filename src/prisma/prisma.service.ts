import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  // tenantId?: string;
  // userRole?: string;

  constructor(configService: ConfigService) {
    super({
      datasources: { db: { url: configService.get('DATABASE_URL') } },
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('Database connected');
      // console.log(this.tenantId, this.userRole);

      // (this as any).$use(async (params: any, next: any) => {
      //   // Only apply tenant filtering for non-admins
      //   if (this.tenantId && this.userRole !== 'ADMIN') {
      //     if (
      //       params.model &&
      //       ['findMany', 'findFirst', 'findUnique'].includes(params.action)
      //     ) {
      //       if (!params.args) params.args = {};
      //       if (!params.args.where) params.args.where = {};
      //       // Inject tenant filter
      //       params.args.where.tenantId = this.tenantId;
      //     }

      //     if (params.model && ['create'].includes(params.action)) {
      //       if (!params.args.data) params.args.data = {};
      //       params.args.data.tenantId = this.tenantId;
      //     }
      //   }

      //   return next(params);
      // });
    } catch (error) {
      console.log(error);
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      console.log('Database disconnected');
    } catch (error) {
      console.log(error);
    }
  }

  // async enableTenantContext(tenantId: string, userRole: string) {
  //   this.tenantId = tenantId;
  //   this.userRole = userRole;
  // }
}
