export interface RedisEvent<T = unknown> {
  event: string;
  payload: T;
}
