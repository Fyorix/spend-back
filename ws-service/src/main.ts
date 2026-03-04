import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    },
  });

  const port = process.env.PORT ?? 3001;

  await app.startAllMicroservices();
  await app.listen(port);
  console.log(`WebSocket Server is running on: http://localhost:${port}`);
  console.log('Redis Microservice transport is connected.');
}
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
