import fs from 'fs';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { TESTCONTAINER_STATE_FILE } from './testcontainer.state';

type ContainerState = {
  containerId: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
};

export default async function globalSetup() {
  const dbTestConfig = {
    username: 'postgres',
    password: 'password',
    database: 'spend_test',
  }
  const postgres = await new PostgreSqlContainer('postgres:alpine')
  .withEnvironment({
      POSTGRES_USER: dbTestConfig.username,
      POSTGRES_PASSWORD: dbTestConfig.password,
      POSTGRES_DB: dbTestConfig.database,
  }).withHealthCheck({
      test: ['CMD-SHELL', `pg_isready -U ${dbTestConfig.username} -d ${dbTestConfig.database}`],
      interval: 1000,
      timeout: 5000,
      retries: 30,
      startPeriod: 1000,
  }).start();

}
