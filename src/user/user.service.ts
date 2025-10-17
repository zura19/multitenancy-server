import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserQueryDto } from './dto/user-query.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers(tenantId?: string, userId?: string, query?: UserQueryDto) {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          companyId: tenantId,
          id: { not: userId },
          name: { contains: query?.name },
        },
        take: 10,
      });

      const passwordHiddenUsers = users.map((user) => ({
        ...user,
        password: undefined,
      }));

      return {
        success: true,
        users: passwordHiddenUsers,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async removeUser(tenantId: string, userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId, companyId: tenantId },
      });

      if (!user)
        throw new BadRequestException(
          'User not found OR not belong to this company',
        );

      await this.prisma.user.delete({
        where: { id: userId },
      });
      return { success: true };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
