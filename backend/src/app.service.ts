import { Injectable } from '@nestjs/common';

import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getHello(): Promise<string> {
    const businesses = await this.prisma.orm.public.Business.all();

    return `Database connected. Businesses: ${businesses.length}`;
  }
}