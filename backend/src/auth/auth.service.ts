import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
    ) { }

    async register(registerDto: RegisterDto) {
        const existingBusiness = await this.prisma.orm.public.Business
            .where({
                name: registerDto.businessName,
            })
            .first();

        if (existingBusiness) {
            throw new ConflictException('Business already exists');
        }

        const passwordHash = await this.usersService.hashPassword(
            registerDto.password,
        );

        return this.prisma.transaction(async (tx) => {
            const business = await tx.orm.public.Business.create({
                name: registerDto.businessName,
                phone: registerDto.phone,
            });

            const user = await tx.orm.public.User.create({
                businessId: business.id,
                name: registerDto.ownerName,
                email: registerDto.email,
                passwordHash,
                role: 'OWNER',
            });

            return {
                businessId: business.id,
                userId: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            };
        });
    }

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