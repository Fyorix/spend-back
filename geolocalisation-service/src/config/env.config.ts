export interface EnvConfig {
  port: number;
  redisHost: string;
  redisPort: number;
  googleMapsApiKey: string;
}

export function loadEnvConfig(): EnvConfig {
  return {
    port: parseInt(process.env.PORT || '3002', 10),
    redisHost: process.env.REDIS_HOST || 'localhost',
    redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  };
}
