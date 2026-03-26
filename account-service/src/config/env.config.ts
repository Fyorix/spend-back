export interface EnvConfig {
  port: number;
  neo4jUrl: string;
  neo4jUser: string;
  neo4jPass: string;
  redisHost: string;
  redisPort: number;
}

export function loadEnvConfig(): EnvConfig {
  return {
    port: parseInt(process.env.PORT || '3005', 10),
    neo4jUrl: process.env.NEO4J_URL || 'bolt://localhost:7687',
    neo4jUser: process.env.NEO4J_USER || 'neo4j',
    neo4jPass: process.env.NEO4J_PASS || 'password',
    redisHost: process.env.REDIS_HOST || 'localhost',
    redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
  };
}
