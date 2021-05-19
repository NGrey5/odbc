import odbc from "odbc";
import { DEFAULT_OPTIONS } from "../constants";
import { createConnectionStringFromConfig } from "../common/createConnectionStringFromConfig";
import { CreateConnectionConfig } from "../types/ConnectionConfig.interface";
import { Options } from "../types/Options.interface";
import { PoolConfig } from "../types/PoolConfig.interface";
import { ODBCConnection } from "./ODBCConnection/ODBCConnection";

export class ODBCConnectionPool {
  private pool: odbc.Pool | undefined;
  private options: Options = DEFAULT_OPTIONS;

  constructor() {}

  public async create(
    connectionConfig: CreateConnectionConfig,
    poolConfig?: PoolConfig,
    options?: Options
  ): Promise<void> {
    const connectionString = createConnectionStringFromConfig(connectionConfig);

    this.pool = await odbc.pool({
      connectionString,
      connectionTimeout: poolConfig?.connectionTimeout,
      loginTimeout: poolConfig?.loginTimeout,
      initialSize: poolConfig?.initialSize,
      incrementSize: poolConfig?.incrementSize,
      maxSize: poolConfig?.maxSize,
      shrink: poolConfig?.shrink,
    });
    this.options = options || this.options;
  }

  public async getConnection(): Promise<ODBCConnection> {
    if (!this.pool) throw new Error(`No active ODBC connection pool exists.`);

    const connection = new ODBCConnection();
    const connFromPool = await this.pool.connect();

    if (!connFromPool) throw new Error(`Could not retrieve a connection from the ODBC pool.`);

    connection.useExistingConnection(connFromPool, this.options);

    return connection;
  }

  public async close(): Promise<void> {
    await this.pool?.close();
  }
}
