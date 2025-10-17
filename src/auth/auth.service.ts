import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserCompanyDto } from './dto/create-company.dto';
import * as argon from 'argon2';
import { JoinUserCompanyDto } from './dto/join-company.dto';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async signUpCreateCompany(body: CreateUserCompanyDto) {
    const { name, email, password, company, companyPassword } = body;
    const existingCompany = await this.prismaService.company.findFirst({
      where: { name: company.trim() },
    });
    if (existingCompany)
      throw new BadRequestException('Company with this name already exists');

    const existingUser = await this.prismaService.user.findFirst({
      where: { email },
    });
    if (existingUser)
      throw new BadRequestException('User with this email already exists');

    const hashedCompanyPassword = await argon.hash(companyPassword);
    const companyCreated = await this.prismaService.company.create({
      data: { name: company, password: hashedCompanyPassword },
    });

    const hashedUserPassword = await argon.hash(password);
    const user = await this.prismaService.user.create({
      data: {
        name,
        email,
        password: hashedUserPassword,
        companyId: companyCreated.id,
        companyRole: 'ADMIN',
      },
    });

    return {
      success: true,
      user,
    };
  }

  async signUpJoinCompany(body: JoinUserCompanyDto) {
    const { name, email, password, company, companyPassword } = body;

    const companyToJoin = await this.prismaService.company.findFirst({
      where: { name: company },
    });
    if (!companyToJoin) throw new BadRequestException(`invalid Company`);

    const isPasswordValid = await argon.verify(
      companyToJoin.password,
      companyPassword,
    );
    if (!isPasswordValid) throw new BadRequestException(`invalid Company`);

    const existingUser = await this.prismaService.user.findFirst({
      where: { email },
    });
    if (existingUser)
      throw new BadRequestException('User with this email already exists');

    const hashedUserPassword = await argon.hash(password);
    const user = await this.prismaService.user.create({
      data: {
        name,
        email,
        password: hashedUserPassword,
        companyId: companyToJoin.id,
      },
    });

    return {
      success: true,
      user,
    };
  }

  async logIn(
    res: Response,
    { email, password }: { email: string; password: string },
  ) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new ForbiddenException('Invalid credentials');
    }

    const isPasswordValid = await argon.verify(user.password, password);
    if (!isPasswordValid) {
      throw new ForbiddenException('Invalid credentials');
    }

    const jwt = await this.signJwt({ email: user.email, id: user.id });

    res.cookie('access_token', jwt.token, {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite:
        this.config.get('NODE_ENV') === 'production' ? 'none' : 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 15, // 15 days
    });
    return {
      success: true,
      user: { ...user, password: undefined },
      // token: jwt.token,
    };
  }

  async logOut(res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite:
        this.config.get('NODE_ENV') === 'production' ? 'none' : 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 15, // 15 days
    });
    return { success: true };
  }

  async signJwt(payload: { email: string; id: string }) {
    const token = await this.jwtService.signAsync(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: '15d',
    });
    return { token };
  }
}
