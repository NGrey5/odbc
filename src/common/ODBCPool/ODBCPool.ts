import odbc from "odbc";
import { ODBCConnection } from "../ODBCConnection/ODBCConnection";
import { ODBCModifiedConnection } from "../ODBCConnectionModifier/ODBCConnectionModifier";
import { ODBCError } from "../ODBCError/ODBCError";
import { ODBCResult } from "../ODBCResult/ODBCResult";
import { ODBCQueryOptions, ODBCQueryParameters } from "../types";

/** Creates an ODBC database pool class asynchronously */
export async function createODBCPool(
  poolParameters: odbc.PoolParameters
): Promise<ODBCPool> {
  return ODBCPool.create(poolParameters);
}

/**
 * An odbc connection pool housing a set number of connections.
 * A connection can be retrieved by calling `connect` on the pool.
 */
export class ODBCPool extends ODBCModifiedConnection {
  private _pool: odbc.Pool | undefined = undefined;

  constructor() {
    super();
  }

  /** Shorthand method for creating an instance of `ODBCPool` and invoking the `init` method. Allows for async creating of the class */
  public static async create(
    poolParameters: odbc.PoolParameters
  ): Promise<ODBCPool> {
    return new ODBCPool().init(poolParameters);
  }

  /** Initializes the odbc database pool */
  public async init(poolParameters: odbc.PoolParameters): Promise<this> {
    try {
      const pool = await odbc.pool(poolParameters);
      this._pool = pool;
      return this;
    } catch (error) {
      throw new ODBCError(error);
    }
  }

  /** Retrieves an `ODBCConnection` from the pool */
  public async connect(): Promise<ODBCConnection> {
    if (!this._pool)
      throw new ODBCError(
        "Could not retrieve a connection from the connection pool. The pool does not exist"
      );
    try {
      const connection = await this._pool.connect();
      return new ODBCConnection()
        .wrapConnection(connection)
        .useConnectionModifier(this.connectionModifier);
    } catch (error) {
      throw new ODBCError(error);
    }
  }

  /**
   * Utility function to execute a query on an open connection in the pool.
   * This method will get a connection, execute the query, return the result set, and return
   * the connection to the pool.
   */
  public async query<T = unknown>(
    statement: string,
    parameters: ODBCQueryParameters = [],
    options: ODBCQueryOptions = {}
  ): Promise<ODBCResult<T>> {
    if (!this._pool) throw new ODBCError("No active ODBC connection pool");
    try {
      const query = this.connectionModifier.getQueryFrom(statement, parameters);
      const result = await this._pool.query<T>(
        query.statement,
        query.parameters,
        options
      );
      return this.connectionModifier.getResultFrom(result);
    } catch (error) {
      throw new ODBCError(error, { statement, parameters });
    }
  }

  /** Closes the database pool of all currently unused connections.
   * Any connections that are currently in progress will not be closed. When those
   * connections are closed they will be discarded.
   */
  public async close(): Promise<void> {
    try {
      await this._pool?.close();
    } catch (error) {
      throw new ODBCError(error);
    }
  }
}
