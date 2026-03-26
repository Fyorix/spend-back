export interface EnvConfig {
  port: number;
  dbHost: string;
  dbPort: number;
  dbUser: string;
  dbPass: string;
  dbName: string;
  googleMapsApiKey: string;
  redisHost: string;
  redisPort: number;
}

export function loadEnvConfig(): EnvConfig {
  return {
    port: parseInt(process.env.PORT || '3002', 10),
    dbHost: process.env.DB_HOST || 'localhost',
    dbPort: parseInt(process.env.DB_PORT || '5432', 10),
    dbUser: process.env.DB_USER || 'postgres',
    dbPass: process.env.DB_PASS || 'password',
    dbName: process.env.DB_NAME || 'spend',
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
    redisHost: process.env.REDIS_HOST || 'localhost',
    redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
  };
}
