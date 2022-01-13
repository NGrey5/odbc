export interface PoolConfig {
  connectionTimeout?: number;
  loginTimeout?: number;
  initialSize?: number;
  incrementSize?: number;
  maxSize?: number;
  shrink?: boolean;
}
