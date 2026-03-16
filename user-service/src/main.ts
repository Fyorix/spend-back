import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { createRequire } from 'module';
import { AppModule } from './app.module.js';
import { loadEnvConfig } from './config/env.config.js';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { CatchGlobalFilter } from './core/errors/http-exception.filter.js';
import { USER_PACKAGE_NAME } from '@clement.pasteau/contracts';

async function bootstrap() {
  const require = createRequire(import.meta.url);
  const config = loadEnvConfig();
  const app = await NestFactory.create(AppModule);

  const contractsPath = join(
    require.resolve('@clement.pasteau/contracts/package.json'),
    '..',
  );

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: USER_PACKAGE_NAME,
      protoPath: join(contractsPath, 'proto/user/user.services.proto'),
      url: '0.0.0.0:50051',
      loader: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
        includeDirs: [join(contractsPath, 'proto')],
      },
    },
  });

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new CatchGlobalFilter(httpAdapterHost));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('User Service API')
    .setDescription('API documentation for the User Service')
    .setVersion('1.0')
    .build();
  const document = () => SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.startAllMicroservices();
  await app.listen(config.port);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
