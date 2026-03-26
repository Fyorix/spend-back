import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { createRequire } from 'module';
import { GEOLOCATION_PACKAGE_NAME } from '@clement.pasteau/contracts';
import { Neo4jModule } from './infra/neo4j/neo4j.module.js';
import { RedisModule } from './infra/redis/redis.module.js';
import { Neo4jTransactionRepository } from './infra/neo4j/neo4j-transaction.repository.js';
import { TransactionService } from './core/services/transaction.service.js';
import { AccountGrpcController } from './controllers/account.grpc.controller.js';

const require = createRequire(import.meta.url);
const contractsPath = join(
  require.resolve('@clement.pasteau/contracts/package.json'),
  '..',
);

@Module({
  imports: [
    Neo4jModule,
    RedisModule,
    ClientsModule.register([
      {
        name: 'GEOLOCATION_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: GEOLOCATION_PACKAGE_NAME,
          protoPath: join(
            contractsPath,
            'proto/geolocation/geolocation.services.proto',
          ),
          url: '0.0.0.0:50053',
          loader: {
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
            includeDirs: [join(contractsPath, 'proto')],
          },
        },
      },
    ]),
  ],
  controllers: [AccountGrpcController],
  providers: [
    TransactionService,
    {
      provide: 'TRANSACTION_REPOSITORY',
      useClass: Neo4jTransactionRepository,
    },
  ],
})
export class AppModule { }
