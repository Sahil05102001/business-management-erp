import { IsEmail, IsInt, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsInt()
  businessId!: number;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}