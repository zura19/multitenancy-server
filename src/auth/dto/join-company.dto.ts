import { IsEmail, IsString, MinLength } from 'class-validator';

export class JoinUserCompanyDto {
  @IsString()
  company: string;

  @IsString()
  companyPassword: string;

  @IsString()
  @MinLength(3)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
