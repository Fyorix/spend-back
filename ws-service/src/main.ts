import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { Logger } from '@nestjs/common';
import { loadEnvConfig } from './config/env.config.js';
import { RedisIoAdapter } from './gateway/redis-io.adapter.js';

async function bootstrap() {
  const config = loadEnvConfig();
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  await app.listen(config.port, '0.0.0.0');
  logger.log(`WebSocket Server is running on: http://localhost:${config.port}`);
  logger.log('Redis Adpater (Synchronization) is active');
}
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
