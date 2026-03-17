import { type TypeOrmModuleOptions } from '@nestjs/typeorm';
import { FileModel } from '../infrastructure/models/file.model.js';

const DB_DEFAULTS: Partial<TypeOrmModuleOptions> = {
  type: 'postgres',
  entities: [FileModel],
};

export const DATABASE_DEV_CONF: TypeOrmModuleOptions = {
  type: DB_DEFAULTS.type,
  host: '0.0.0.0',
  port: 5432,
  username: 'postgres',
  password: 'password',
  database: 'spend',
  entities: DB_DEFAULTS.entities,
  synchronize: true,
};

export const DATABASE_PROD_CONFIG: TypeOrmModuleOptions = {
  type: DB_DEFAULTS.type,
  host: process.env.DB_HOST || '0.0.0.0',
  port: Number.parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'spend',
  entities: DB_DEFAULTS.entities,
  synchronize: true,
};
