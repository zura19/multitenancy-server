import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { JwtGuard } from 'src/guards/jwt.guard';
import { AppAdminGuard } from 'src/guards/app-admin.guard';

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
}
