import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import * as os from 'os';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Spend API Gateway')
    .setDescription('The Spend API Gateway for microservices interaction')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors();

  const port = 3000;
  await app.listen(port, '0.0.0.0');

  const networkInterfaces = os.networkInterfaces();
  const localIp = Object.values(networkInterfaces)
    .flat()
    .find((iface) => iface?.family === 'IPv4' && !iface?.internal)?.address;

  const logger = new Logger('Bootstrap');
  logger.log(`Spend API Gateway is running on:`);
  logger.log(`Local:   http://localhost:${port}`);
  logger.log(`Network: http://${localIp}:${port}`);
  logger.log(`Swagger: http://${localIp}:${port}/api`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
