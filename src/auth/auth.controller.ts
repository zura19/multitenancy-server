import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { type Request, type Response } from 'express';
import { CreateUserCompanyDto } from './dto/create-company.dto';
import { JoinUserCompanyDto } from './dto/join-company.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(201)
  @Post('/signup-create-company')
  signUpCreateCompany(
    @Body()
    body: CreateUserCompanyDto,
  ) {
    return this.authService.signUpCreateCompany(body);
  }

  @HttpCode(201)
  @Post('signup-join-company')
  signUpUser(
    @Body()
    body: JoinUserCompanyDto,
  ) {
    return this.authService.signUpJoinCompany(body);
  }

  @HttpCode(201)
  @Post('login')
  async login(
    // @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: { email: string; password: string },
  ) {
    return this.authService.logIn(res, body);
  }

  @HttpCode(201)
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logOut(res);
  }
}
