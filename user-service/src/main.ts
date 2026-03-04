import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { loadEnvConfig } from './config/env.config.js';

async function bootstrap() {
  const config = loadEnvConfig();
  const app = await NestFactory.create(AppModule);
  await app.listen(config.port);
}
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
