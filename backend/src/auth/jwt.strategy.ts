import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  async validate(payload: {
    sub: number;
    businessId: number;
    role: 'OWNER' | 'ACCOUNTANT' | 'SALES_STAFF';
    email: string;
  }) {
    return {
      userId: payload.sub,
      businessId: payload.businessId,
      role: payload.role,
      email: payload.email,
    };
  }
}