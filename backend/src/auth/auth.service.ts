import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    businessId: number,
    email: string,
    password: string,
  ) {
    const user = await this.usersService.findByEmail(businessId, email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = await this.usersService.verifyPassword(
      password,
      String(user.passwordHash),
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

  async login(
    businessId: number,
    email: string,
    password: string,
  ) {
    const user = await this.validateUser(businessId, email, password);

    const payload = {
      sub: user.id,
      businessId,
      role: user.role,
      email: String(user.email),
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }
}