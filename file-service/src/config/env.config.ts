export interface EnvConfig {
  port: number;
  redisHost: string;
  redisPort: number;
  jwtSecret: string;
}

export function loadEnvConfig(): EnvConfig {
  return {
    port: parseInt(process.env.PORT ?? '3003', 10),
    redisHost: process.env.REDIS_HOST ?? 'localhost',
    redisPort: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    jwtSecret: process.env.JWT_SECRET ?? 'dev-jwt-secret',
  };
}

export interface S3Config {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
}

export function loadS3Config(): S3Config {
  return {
    endpoint: process.env.S3_ENDPOINT ?? 'http://localhost:9000',
    region: process.env.S3_REGION ?? 'eu-west-3',
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? 'minioadmin',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? 'minioadmin',
    bucketName: process.env.S3_BUCKET_NAME ?? 'files',
  };
}
