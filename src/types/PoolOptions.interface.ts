export interface PoolOptions {
  connectionTimeout?: number;
  loginTimeout?: number;
  initialSize?: number;
  incrementSize?: number;
  maxSize?: number;
  shrink?: number;
}
