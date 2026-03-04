import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { loadEnvConfig } from './config/env.config.js';

async function bootstrap() {
  const config = loadEnvConfig();
  const app = await NestFactory.create(AppModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Geolocalisation Service')
    .setDescription('API for geolocalisation management and event testing')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(config.port);
}
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
