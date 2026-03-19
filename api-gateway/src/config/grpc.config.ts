import { createRequire } from 'module';
import { join } from 'path';
import { MicroserviceOptions } from '@nestjs/microservices';
import { GEOLOCATION_PACKAGE_NAME } from '@clement.pasteau/contracts';

const require = createRequire(import.meta.url);
const contractsPath = join(
  require.resolve('@clement.pasteau/contracts/package.json'),
  '..',
);

export const geolocationGrpcConfig: MicroserviceOptions['options'] = {
  package: GEOLOCATION_PACKAGE_NAME,
  protoPath: join(
    contractsPath,
    'proto/geolocation/geolocation.services.proto',
  ),
  url: 'localhost:50053',
  loader: {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
    includeDirs: [join(contractsPath, 'proto')],
  },
};
