export interface EnvConfig {
  port: number;
  accessTokenDuration: number;
}

export function loadEnvConfig(): EnvConfig {
  return {
    port: parseInt(process.env.PORT || '3004', 10),
    accessTokenDuration: parseInt(
      process.env.ACCESS_TOKEN_DURATION || '300000',
      10,
    ), // default to 5 minutes
  };
}
