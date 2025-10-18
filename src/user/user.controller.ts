import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { type Request } from 'express';
import { JwtGuard } from 'src/guards/jwt.guard';
import { Tenant } from 'src/decorators/tenant.decorator';
import { User } from 'src/decorators/user.decorator';
import { Prisma } from '@prisma/client';
import { UserQueryDto } from './dto/user-query.dto';
import { companyAdminGuard } from 'src/guards/company-admin.guard';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @HttpCode(200)
  @UseGuards(JwtGuard)
  @Get()
  getAllUsers(
    @Tenant() tenantId?: string,
    @User() user?: Prisma.UserCreateInput,
    @Query() query?: UserQueryDto,
  ) {
    return this.userService.getAllUsers(tenantId, user?.id, query);
  }

  @HttpCode(201)
  @UseGuards(JwtGuard, companyAdminGuard)
  @Delete(':id')
  removeUser(@Tenant() tenantId: string, @Param('id') id: string) {
    return this.userService.removeUser(tenantId, id);
  }

  @HttpCode(200)
  @UseGuards(JwtGuard)
  @Get('/me')
  me(@User() user) {
    return {
      success: true,
      user,
    };
  }
}
