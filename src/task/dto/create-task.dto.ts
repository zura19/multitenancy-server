import { IsOptional, IsString, MinLength } from 'class-validator';

export class createTaskDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsString()
  shouldBeDoneBy: string;

  @IsString()
  assignedToId: string;
}
