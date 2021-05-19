import { ODBCConnectionPool } from "../../classes/ODBCConnectionPool/ODBCConnectionPool";
import { CreateConnectionConfig, Options, PoolConfig } from "../../types";

export async function createConnectionPool(
  connectionConfig: CreateConnectionConfig,
  poolConfig?: PoolConfig,
  options?: Options
): Promise<ODBCConnectionPool> {
  const pool = new ODBCConnectionPool();
  await pool.create(connectionConfig, poolConfig, options);
  return pool;
}
