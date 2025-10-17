import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { Tenant } from 'src/decorators/tenant.decorator';
import { JwtGuard } from 'src/guards/jwt.guard';
import { User } from 'src/decorators/user.decorator';
import { Prisma } from '@prisma/client';
import { createTaskDto } from './dto/create-task.dto';
import { companyAdminGuard } from 'src/guards/company-admin.guard';
import { TaskQueryDto } from './dto/task-query.dto';
import { ChangeStatusDto } from './dto/change-status.dto';

@Controller('task')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @HttpCode(200)
  @UseGuards(JwtGuard)
  @Get()
  getAllTasks(
    @Tenant() tenantId: string,
    @User() user: Prisma.UserCreateInput,
    @Query() query?: TaskQueryDto,
  ) {
    return this.taskService.getTasks(tenantId, user, query);
  }

  @HttpCode(201)
  @UseGuards(JwtGuard, companyAdminGuard)
  @Post()
  createTask(
    @User() user: Prisma.UserCreateInput,
    @Body() body: createTaskDto,
    @Tenant() tenantId?: string,
  ) {
    console.log('tenantId:', tenantId);
    return this.taskService.createTask(tenantId, user, body);
  }

  @HttpCode(200)
  @UseGuards(JwtGuard)
  @Get(':id')
  getTaskById(
    @Tenant() tenantId: string,
    @User() user: Prisma.UserCreateInput,
    @Param('id') id: string,
  ) {
    return this.taskService.getTaskById(tenantId, user, id);
  }

  @HttpCode(200)
  @UseGuards(JwtGuard)
  @Patch('/:id')
  updateTask(
    @Tenant() tenantId: string,
    @User() user: Prisma.UserCreateInput,
    @Param('id') id: string,
    @Body() body: Partial<createTaskDto>,
  ) {
    return this.taskService.updateTask(tenantId, user, id, body);
  }

  @HttpCode(200)
  @UseGuards(JwtGuard)
  @Patch('/:id/change-status')
  changeTaskStatus(
    @Tenant() tenantId: string,
    @User() user: Prisma.UserCreateInput,
    @Param('id') id: string,
    @Body() body: ChangeStatusDto,
  ) {
    return this.taskService.changeTaskStatus(tenantId, user, id, body);
  }
}
