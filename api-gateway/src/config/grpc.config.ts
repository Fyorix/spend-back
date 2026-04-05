import { createRequire } from 'module';
import { join } from 'path';
import { GrpcOptions } from '@nestjs/microservices';
import {
  GEOLOCATION_PACKAGE_NAME,
  USER_PACKAGE_NAME,
  ACCOUNT_PACKAGE_NAME,
  FILE_PACKAGE_NAME,
} from '@clement.pasteau/contracts';

const require = createRequire(import.meta.url);
const contractsPath = join(require.resolve('@clement.pasteau/contracts/package.json'), '..');

export const geolocationGrpcConfig: GrpcOptions['options'] = {
  package: GEOLOCATION_PACKAGE_NAME,
  protoPath: join(contractsPath, 'proto/geolocation/geolocation.services.proto'),
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

export const userGrpcConfig: GrpcOptions['options'] = {
  package: USER_PACKAGE_NAME,
  protoPath: join(contractsPath, 'proto/user/user.services.proto'),
  url: 'localhost:50051',
  loader: {
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
    includeDirs: [join(contractsPath, 'proto')],
  },
};

export const accountGrpcConfig: GrpcOptions['options'] = {
  package: ACCOUNT_PACKAGE_NAME,
  protoPath: join(contractsPath, 'proto/account/account.services.proto'),
  url: 'localhost:50052',
  loader: {
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
    includeDirs: [join(contractsPath, 'proto')],
  },
};

export const fileGrpcConfig: GrpcOptions['options'] = {
  package: FILE_PACKAGE_NAME,
  protoPath: join(contractsPath, 'proto/file/file.services.proto'),
  url: 'localhost:50054',
  loader: {
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
    includeDirs: [join(contractsPath, 'proto')],
  },
};
