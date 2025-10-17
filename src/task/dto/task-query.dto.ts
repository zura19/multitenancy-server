import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';

export class TaskQueryDto {
  @IsOptional()
  @IsEnum(['logged'])
  type: 'logged';

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page: string;
}
