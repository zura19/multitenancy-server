import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as argon from 'argon2';

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

  async changeCompanyPassword(tenantId: string, body: ChangePasswordDto) {
    if (!tenantId)
      throw new NotFoundException(
        'You do not have permission to change company password',
      );
    try {
      const { currentPassword, newPassword, confirmPassword } = body;

      if (newPassword !== confirmPassword)
        throw new BadRequestException('Passwords do not match');
      if (newPassword === currentPassword)
        throw new BadRequestException(
          'New password cannot be same as current password',
        );

      const company = await this.prisma.company.findUnique({
        where: { id: tenantId },
      });
      if (!company) throw new NotFoundException('Company not found');

      const verifyPassword = await argon.verify(
        company.password,
        currentPassword,
      );
      if (!verifyPassword)
        throw new BadRequestException('Password is incorrect');

      const password = await argon.hash(newPassword);
      await this.prisma.company.update({
        where: {
          id: tenantId,
        },
        data: {
          password,
        },
      });

      return { success: true };
    } catch (error) {
      throw error;
    }
  }
}
