import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { createRequire } from 'module';
import { AppModule } from './app.module.js';
import { loadEnvConfig } from './config/env.config.js';
import { GEOLOCATION_PACKAGE_NAME } from '@clement.pasteau/contracts';

async function bootstrap() {
  const require = createRequire(import.meta.url);
  const config = loadEnvConfig();
  const app = await NestFactory.create(AppModule);

  const contractsPath = join(require.resolve('@clement.pasteau/contracts/package.json'), '..');

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: GEOLOCATION_PACKAGE_NAME,
      protoPath: join(contractsPath, 'proto/geolocation/geolocation.services.proto'),
      url: '0.0.0.0:50053',
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

  await app.startAllMicroservices();
  await app.listen(config.port);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
