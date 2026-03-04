export interface EnvConfig {
  port: number;
}

export function loadEnvConfig(): EnvConfig {
  return {
    port: parseInt(process.env.PORT || '3004', 10),
  };
}
