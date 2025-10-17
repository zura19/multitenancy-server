import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { createTaskDto } from './dto/create-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { ChangeStatusDto } from './dto/change-status.dto';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async getTasks(
    tenantId: string,
    user: Prisma.UserCreateInput,
    query?: TaskQueryDto,
  ) {
    console.log(query?.type);
    const page = (query?.page && +query?.page) || 1;
    const take = 10;
    const skip = (page - 1) * take;
    const assignedTo = () => {
      return query?.type === 'logged' ? user.id : undefined;
    };

    const tasks = await this.prisma.task.findMany({
      where: {
        companyId: tenantId,
        assignedToId: assignedTo(),
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      skip,
      take,

      orderBy: [
        {
          createdAt: 'desc',
        },
      ],
    });

    const count = await this.prisma.task.count({
      where: {
        companyId: tenantId,
        assignedToId: assignedTo(),
      },
    });

    const hasNextPage = count > skip + take;
    const nextPage = hasNextPage ? page + 1 : null;

    return {
      success: true,
      tasks,
      nextPage,
    };
  }

  async createTask(
    tenantId: string | undefined,
    user: Prisma.UserCreateInput,
    body: createTaskDto,
  ) {
    if (!tenantId) throw new NotFoundException('Tenant not found');

    try {
      const { title, description, assignedToId, shouldBeDoneBy } = body;
      const assagnedTo = await this.prisma.user.findUnique({
        where: {
          id: assignedToId,
        },
      });

      console.log(tenantId, assagnedTo?.companyId);

      if (!assagnedTo || assagnedTo.companyId !== tenantId)
        throw new NotFoundException(
          'User not found OR not belong to this company',
        );

      const task = await this.prisma.task.create({
        data: {
          companyId: tenantId,
          createdById: user.id as string,
          title,
          description,
          assignedToId,
          shouldBeDoneBy,
        },
      });

      return {
        success: true,
        task,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getTaskById(
    tenantId: string,
    user: Prisma.UserCreateInput,
    taskId: string,
  ) {
    try {
      const task = await this.prisma.task.findUnique({
        where: { id: taskId, companyId: tenantId },
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!task) throw new NotFoundException('Task not found');
      if (user.companyRole !== 'ADMIN' && task.assignedToId !== user.id)
        throw new NotFoundException('You are not allowed to view this task!');

      return { success: true, task };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateTask(
    tenantId: string,
    user: Prisma.UserCreateInput,
    taskId: string,
    body: Partial<createTaskDto>,
  ) {
    try {
      const { title, description, assignedToId, shouldBeDoneBy } = body;
      const task = await this.prisma.task.findUnique({
        where: { id: taskId, companyId: tenantId },
      });

      if (!task) throw new NotFoundException('Task not found');

      if (user.companyRole !== 'ADMIN' && task.assignedToId !== user.id)
        throw new ForbiddenException(
          'You are not allowed to update this task!',
        );

      const updatedTask = await this.prisma.task.update({
        where: { id: taskId },
        data: {
          title,
          description,
          assignedToId,
          shouldBeDoneBy,
        },
      });

      return { success: true, task: updatedTask };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async changeTaskStatus(
    tenantId: string,
    user: Prisma.UserCreateInput,
    id: string,
    body: ChangeStatusDto,
  ) {
    try {
      const { status } = body;
      const task = await this.prisma.task.findUnique({
        where: { id, companyId: tenantId },
      });
      console.log(task);

      if (!task) throw new NotFoundException('Task not found');

      if (user.companyRole !== 'ADMIN' && task.assignedToId !== user.id)
        throw new ForbiddenException(
          'You are not allowed to update this task!',
        );

      const updatedTask = await this.prisma.task.update({
        where: { id },
        data: { status },
      });

      return { success: true, status: updatedTask.status };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
