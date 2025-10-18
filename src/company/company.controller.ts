import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { JwtGuard } from 'src/guards/jwt.guard';
import { AppAdminGuard } from 'src/guards/app-admin.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Tenant } from 'src/decorators/tenant.decorator';
import { companyAdminGuard } from 'src/guards/company-admin.guard';

@Controller('company')
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @HttpCode(200)
  @UseGuards(JwtGuard, AppAdminGuard)
  @Get()
  getCompanies() {
    return this.companyService.getCompanies();
  }

  @HttpCode(200)
  @UseGuards(JwtGuard, AppAdminGuard)
  @Get(':id')
  getCompanyById(@Param('id') id: string) {
    return this.companyService.geCompanyById(id);
  }

  @HttpCode(200)
  @UseGuards(JwtGuard, AppAdminGuard)
  @Delete(':id')
  getCompanyUsers(@Param('id') id: string) {
    return this.companyService.deleteCompany(id);
  }

  @HttpCode(201)
  @UseGuards(JwtGuard, companyAdminGuard)
  @Patch('/change-password')
  changePassword(@Tenant() tenantId: string, @Body() body: ChangePasswordDto) {
    return this.companyService.changeCompanyPassword(tenantId, body);
  }
}
