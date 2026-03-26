import { Global, Module, Inject, type OnApplicationShutdown } from '@nestjs/common';
import neo4j, { type Driver } from 'neo4j-driver';
import { loadEnvConfig } from '../../config/env.config.js';

export const NEO4J_DRIVER = 'NEO4J_DRIVER';

@Global()
@Module({
  providers: [
    {
      provide: NEO4J_DRIVER,
      useFactory: () => {
        const config = loadEnvConfig();
        return neo4j.driver(config.neo4jUrl, neo4j.auth.basic(config.neo4jUser, config.neo4jPass));
      },
    },
  ],
  exports: [NEO4J_DRIVER],
})
export class Neo4jModule implements OnApplicationShutdown {
  constructor(@Inject(NEO4J_DRIVER) private readonly driver: Driver) {}

  async onApplicationShutdown() {
    await this.driver.close();
  }
}
