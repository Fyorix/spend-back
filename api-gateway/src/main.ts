import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import * as os from 'os';
import { IncomingMessage } from 'http';
import { Socket } from 'net';
import { JwtService } from '@nestjs/jwt';
import { createWsProxyMiddleware } from './config/proxy.config.js';
import { loadEnvConfig } from './config/env.config.js';

async function bootstrap() {
  const env = loadEnvConfig();
  const logger = new Logger('Bootstrap');

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

  const jwtService = app.get(JwtService);
  const proxyMiddleware = createWsProxyMiddleware(jwtService) as any;
  app.use('/socket.io', proxyMiddleware);

  const server = app.getHttpServer();
  server.on('upgrade', (req: IncomingMessage, socket: Socket, head: Buffer) => {
    if (req.url?.startsWith('/socket.io')) {
      proxyMiddleware.upgrade(req, socket, head);
    }
  });

  await app.listen(env.port, '0.0.0.0');

  const networkInterfaces = os.networkInterfaces();
  const localIp = Object.values(networkInterfaces)
    .flat()
    .find((iface) => iface?.family === 'IPv4' && !iface?.internal)?.address;

  logger.log(`Spend API Gateway is running on:`);
  logger.log(`Local:   http://localhost:${env.port}`);
  logger.log(`Network: http://${localIp}:${env.port}`);
  logger.log(`Swagger: http://${localIp}:${env.port}/api`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
