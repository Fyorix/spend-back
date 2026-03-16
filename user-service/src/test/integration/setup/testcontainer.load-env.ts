/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import fs from 'fs';
import { TESTCONTAINER_STATE_FILE } from './testcontainer.state.js';

type ContainerState = {
  containerId: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
};

if (!fs.existsSync(TESTCONTAINER_STATE_FILE)) {
  throw new Error(
    `Missing Testcontainers state file at ${TESTCONTAINER_STATE_FILE}. Ensure globalSetup ran successfully.`,
  );
}

const state: ContainerState = JSON.parse(
  fs.readFileSync(TESTCONTAINER_STATE_FILE, 'utf-8'),
);

process.env.NODE_ENV = 'test';
process.env.DB_HOST = state.host;
process.env.DB_PORT = String(state.port);
process.env.DB_USERNAME = state.username;
process.env.DB_PASSWORD = state.password;
process.env.DB_NAME = state.database;
process.env.POSTGRES_HOST = state.host;
process.env.POSTGRES_PORT = String(state.port);
process.env.POSTGRES_USER = state.username;
process.env.POSTGRES_PASSWORD = state.password;
process.env.POSTGRES_DB = state.database;
