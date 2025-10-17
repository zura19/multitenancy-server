import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserCompanyDto {
  @IsString()
  @MinLength(1)
  company: string;

  @IsString()
  @MinLength(8)
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
