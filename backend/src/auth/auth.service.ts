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

            const location = await tx.orm.public.Location.create({
                businessId: business.id,
                name: 'Main Location',
                code: 'MAIN',
                isDefault: true,
            });

            const systemAccounts = [
                { code: '1000', name: 'Cash', accountType: 'ASSET' },
                { code: '1010', name: 'Bank', accountType: 'ASSET' },
                { code: '1100', name: 'Accounts Receivable', accountType: 'ASSET' },
                { code: '1200', name: 'Inventory', accountType: 'ASSET' },
                { code: '2000', name: 'Accounts Payable', accountType: 'LIABILITY' },
                { code: '2100', name: 'Output GST', accountType: 'LIABILITY' },
                { code: '2200', name: 'Input GST', accountType: 'ASSET' },
                { code: '3000', name: "Owner's Capital", accountType: 'EQUITY' },
                { code: '4000', name: 'Sales Revenue', accountType: 'REVENUE' },
                { code: '5000', name: 'Cost of Goods Sold', accountType: 'EXPENSE' },
                { code: '5100', name: 'General Expense', accountType: 'EXPENSE' },
            ];

            for (const account of systemAccounts) {
                await tx.orm.public.Account.create({
                    businessId: business.id,
                    code: account.code,
                    name: account.name,
                    accountType: account.accountType,
                    isSystem: true,
                });
            }

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