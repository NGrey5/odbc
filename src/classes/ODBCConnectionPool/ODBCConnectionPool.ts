import odbc from "odbc";
import { createConnectionStringFromConfig } from "../../common/createConnectionStringFromConfig";
// Error Handling
import { transformODBCError } from "../../common/throwODBCError";
import { DEFAULT_OPTIONS } from "../../constants";
import { CreateConnectionConfig } from "../../types/ConnectionConfig.interface";
import { Options } from "../../types/Options.interface";
import { PoolConfig } from "../../types/PoolConfig.interface";
import { ODBCConnection } from "../ODBCConnection/ODBCConnection";
import { ODBCErrorResult } from "../ODBCErrorResult/ODBCErrorResult";

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
    try {
      this.pool = await odbc.pool({
        connectionString,
        connectionTimeout: poolConfig?.connectionTimeout,
        loginTimeout: poolConfig?.loginTimeout,
        initialSize: poolConfig?.initialSize,
        incrementSize: poolConfig?.incrementSize,
        maxSize: poolConfig?.maxSize,
        shrink: poolConfig?.shrink,
      });
    } catch (error: any) {
      throw transformODBCError(error);
    }
    this.options = options || this.options;
  }

  public async getConnection(): Promise<ODBCConnection> {
    if (!this.pool) throw new Error(`No active ODBC connection pool exists.`);

    const connection = new ODBCConnection();

    let connFromPool: odbc.Connection;
    try {
      connFromPool = await this.pool.connect();
    } catch (error) {
      throw transformODBCError(error);
    }

    if (!connFromPool)
      throw new ODBCErrorResult(
        "Could not retrieve a connection from the odbc pool."
      );

    connection.useExistingConnection(connFromPool, this.options);

    return connection;
  }

  public async close(): Promise<void> {
    try {
      await this.pool?.close();
    } catch (error) {
      throw transformODBCError(error);
    }
  }
}
