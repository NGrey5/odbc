import odbc from "odbc";
import { DEFAULT_OPTIONS } from "../constants";
import { getConnectionString } from "../functions";
import { ConnectionStringOptions } from "../types/ConnectionStringOptions.interface";
import { DSN } from "../types/DSN.type";
import { Options } from "../types/Options.interface";
import { PoolOptions } from "../types/PoolOptions.interface";
import { ODBCConnection } from "./ODBCConnection";

export class ODBCConnectionPool {
  private pool: odbc.Pool | undefined;
  private options: Options = DEFAULT_OPTIONS;

  constructor() {}

  public async create(
    connectionStringOptions: DSN | ConnectionStringOptions,
    poolOptions?: PoolOptions,
    options?: Options
  ): Promise<void> {
    const connectionString = getConnectionString(connectionStringOptions);

    this.pool = await odbc.pool({
      connectionString,
      connectionTimeout: poolOptions?.connectionTimeout,
      loginTimeout: poolOptions?.loginTimeout,
      initialSize: poolOptions?.initialSize,
      incrementSize: poolOptions?.incrementSize,
      maxSize: poolOptions?.maxSize,
      shrink: poolOptions?.shrink,
    });
    this.options = options || this.options;
  }

  public async getConnection(): Promise<ODBCConnection> {
    if (!this.pool) throw new Error(`No active ODBC connection pool exists.`);

    const connection = new ODBCConnection();
    const connFromPool = await this.pool.connect();

    if (!connFromPool)
      throw new Error(`Could not retrieve a connection from the ODBC pool.`);

    connection.useExistingConnection(connFromPool, this.options);

    return connection;
  }

  public async close(): Promise<void> {
    await this.pool?.close();
  }
}
