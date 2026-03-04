import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { Logger } from '@nestjs/common';
import { loadEnvConfig } from './config/env.config.js';

async function bootstrap() {
  const config = loadEnvConfig();
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  await app.listen(config.port);
  logger.log(`WebSocket Server is running on: http://localhost:${config.port}`);
  logger.log('Redis Pub/Sub is active');
}
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
