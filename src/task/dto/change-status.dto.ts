import { TaskStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class ChangeStatusDto {
  @IsEnum(TaskStatus)
  status: TaskStatus;
}
