import 'dotenv/config';

import { Temporal as TemporalPolyfill } from '@js-temporal/polyfill';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

(globalThis as typeof globalThis & {
  Temporal: typeof TemporalPolyfill;
}).Temporal = TemporalPolyfill;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();