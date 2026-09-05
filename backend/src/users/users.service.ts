import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 12);
    }

    async createUser(data: {
        businessId: number;
        name: string;
        email: string;
        password: string;
        role?: 'OWNER' | 'ACCOUNTANT' | 'SALES_STAFF';
    }) {
        const passwordHash = await this.hashPassword(data.password);

        return this.prisma.orm.public.User.create({
            data: {
                businessId: data.businessId,
                name: data.name,
                email: data.email,
                passwordHash,
                role: data.role ?? 'SALES_STAFF',
            },
        });
    }
    async findByEmail(businessId: number, email: string) {
        return this.prisma.orm.public.User
            .where({
                businessId,
                email,
            })
            .first();
    }
    async verifyPassword(password: string, passwordHash: string): Promise<boolean> {
        return bcrypt.compare(password, passwordHash);
    }
}