export interface EnvConfig {
  port: number;
  redisHost: string;
  redisPort: number;
}

export function loadEnvConfig(): EnvConfig {
  return {
    port: parseInt(process.env.PORT || '3001', 10),
    redisHost: process.env.REDIS_HOST || 'localhost',
    redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
  };
}
