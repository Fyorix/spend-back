import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { loadEnvConfig } from './config/env.config.js';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const config = loadEnvConfig();
  const app = await NestFactory.create(AppModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('User Service API')
    .setDescription('API documentation for the User Service')
    .setVersion('1.0')
    .build();
  const document = () => SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(config.port);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
