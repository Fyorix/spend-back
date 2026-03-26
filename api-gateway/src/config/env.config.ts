export interface EnvConfig {
  port: number;
  wsServiceUrl: string;
  jwtSecret: string;
}

export function loadEnvConfig(): EnvConfig {
  return {
    port: parseInt(process.env.PORT || '3000', 10),
    wsServiceUrl: process.env.WS_SERVICE_URL || 'http://localhost:3001',
    jwtSecret: process.env.JWT_SECRET || 'dev-jwt-secret',
  };
}
