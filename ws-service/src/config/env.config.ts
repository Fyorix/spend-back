export interface EnvConfig {
  port: number;
  redisHost: string;
  redisPort: number;
  gatewayUrl: string;
}

export function loadEnvConfig(): EnvConfig {
  return {
    port: parseInt(process.env.PORT || '3001', 10),
    redisHost: process.env.REDIS_HOST || 'localhost',
    redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
    gatewayUrl: process.env.GATEWAY_URL || 'http://localhost:3000',
  };
}
