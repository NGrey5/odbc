import * as odbc from "odbc";
import { PoolConfig } from "../../../types";

export async function exposeODBCPool(config: PoolConfig & { connectionString: string }): Promise<odbc.Pool> {
  const pool = await odbc.pool({
    connectionString: config?.connectionString,
    connectionTimeout: config?.connectionTimeout,
    incrementSize: config?.incrementSize,
    initialSize: config?.initialSize,
    loginTimeout: config?.loginTimeout,
    maxSize: config?.maxSize,
    shrink: config?.shrink,
  });
  return pool;
}
