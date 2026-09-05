import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import postgres from '@prisma/orm-postgres/runtime';

import contractJson from '../../prisma/contract.json';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly db = postgres({
    contractJson,
    url: process.env.DATABASE_URL,
  });

  async onModuleInit() {
    await this.db.connect();
  }

  async onModuleDestroy() {
    await this.db.close();
  }

  get orm() {
    return this.db.orm;
  }

  get sql() {
    return this.db.sql;
  }

  transaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    return this.db.transaction(fn);
  }
}