import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async getCompanies() {
    const companies = await this.prisma.company.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      companies,
    };
  }

  async geCompanyById(id: string) {
    try {
      const company = await this.prisma.company.findUnique({
        where: { id },
        include: {
          users: { where: { companyRole: 'ADMIN' } },
        },
      });

      if (!company) throw new NotFoundException('Company not found');

      const totalUsers = await this.prisma.user.count({
        where: {
          companyId: id,
        },
      });

      const totalTasks = await this.prisma.task.count({
        where: {
          companyId: id,
        },
      });

      const modified = {
        ...company,
        password: undefined,
        users: undefined,
        admin: { ...company.users[0], password: undefined },
        totalUsers,
        totalTasks,
      };

      return {
        success: true,
        company: modified,
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteCompany(id: string) {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          companyId: id,
        },
      });

      const tasks = await this.prisma.task.findMany({
        where: {
          companyId: id,
        },
      });

      const company = await this.prisma.company.delete({
        where: {
          id,
        },
      });

      if (!company) throw new NotFoundException('Company not found');

      await this.prisma.user.deleteMany({
        where: {
          id: {
            in: users.map((user) => user.id),
          },
        },
      });

      await this.prisma.task.deleteMany({
        where: {
          id: {
            in: tasks.map((task) => task.id),
          },
        },
      });

      return { success: true };
    } catch (error) {
      throw error;
    }
  }
}
