import odbc from "odbc";
import { createConnectionStringFromConfig } from "../../common/createConnectionStringFromConfig";
import { customInsertParams } from "../../common/customInsertParams";
// Error Handling
import {
  throwODBCError,
  transformODBCError,
} from "../../common/throwODBCError";
import { trimEndOfResults } from "../../common/trimEndOfResults";
import { DEFAULT_OPTIONS } from "../../constants";
import { QueryParameter } from "../../types";
import { CreateConnectionConfig } from "../../types/ConnectionConfig.interface";
import { Options } from "../../types/Options.interface";
import { ODBCErrorResult } from "../ODBCErrorResult/ODBCErrorResult";

export class ODBCConnection {
  private connection: odbc.Connection | undefined;
  private options: Options = DEFAULT_OPTIONS;

  private isTransaction: boolean = false;

  constructor() {}

  // Connection

  public useExistingConnection(connection: odbc.Connection, options?: Options) {
    this.connection = connection;
    this.setOptions(options);
  }

  public async connect(
    config: CreateConnectionConfig,
    options?: Options
  ): Promise<void> {
    // If trying to connect on this connection and already connected
    // then close the current connection
    if (this.connection !== undefined) this.close();
    // Create the new connection and assign it to this.connection
    const connectionString = createConnectionStringFromConfig(config);
    try {
      this.connection = await odbc.connect({ connectionString });
    } catch (error: any) {
      throw transformODBCError(error);
    }
    this.setOptions(options);
  }

  // Query

  /**
   * Returns the results of the query in an array. This calls queryMany internally.
   * @param sql (string) - the sql statement to execute
   * @param parameters (array) - the parameters to inject into the sql statement at '?'
   * @returns the result of the query
   */
  public async query<T = any>(
    sql: string,
    parameters?: QueryParameter[]
  ): Promise<T[]> {
    return this.queryMany<T>(sql, parameters);
  }

  /**
   * Returns the results of the query as an object or null if no result.
   * @param sql (string) - the sql statement to execute
   * @param parameters (array) - the parameters to inject into the sql statement at '?'
   * @returns the result of the query
   */
  public async queryOne<T = any>(
    sql: string,
    parameters?: QueryParameter[]
  ): Promise<T> {
    const result: T[] = await this.executeQuery(sql, parameters);
    return result[0];
  }

  /**
   * Returns the results of the query in an array.
   * @param sql (string) - the sql statement to execute
   * @param parameters (array) - the parameters to inject into the sql statement at '?'
   * @returns the result of the query
   */
  public async queryMany<T = any>(
    sql: string,
    parameters?: QueryParameter[]
  ): Promise<T[]> {
    const result: T[] = await this.executeQuery(sql, parameters);
    return result;
  }

  /**
   * Closes the current ODBC connection. If a transaction is in progress, it will automatically rollback all changes
   */
  public async close(): Promise<void> {
    try {
      await this.connection?.close();
      this.connection === undefined;
    } catch (error) {
      throw transformODBCError(error);
    }
  }

  /**
   * Sets the isolation level for the connection and applies to each transaction within the connection
   * @param isolationLevel SQL_TXN_ISOLATION option (number)
   */
  public async setIsolationLevel(isolationLevel: number): Promise<void> {
    if (!this.connection)
      throw new ODBCErrorResult(
        "Could not set the isolation level. There was no active ODBC connection found."
      );

    try {
      await this.connection.setIsolationLevel(isolationLevel);
    } catch (error) {
      throwODBCError(error);
    }
  }

  // Transaction

  /**
   * Begins a transaction within the ODBC connection. ODBC by default runs all queries inside a transaction.
   * The only difference is that beginTransaction will set AUTO_COMMIT to off, preventing each query from being automatically commited.
   * The queries provided to the transaction will only be commited explicity by using commit or rollback to end the transaction.
   * @param isolationLevel SQL_TXN_ISOLATION option (optional number)
   */
  public async beginTransaction(isolationLevel?: number): Promise<void> {
    if (!this.connection)
      throw new ODBCErrorResult(
        `Could not being the transaction. There was no active odbc connection found.`
      );

    // If an isolation level for the specific transaction has been specified, then set it
    if (isolationLevel) this.setIsolationLevel(isolationLevel);

    try {
      await this.connection.beginTransaction();
      this.isTransaction = true;
    } catch (error) {
      throw transformODBCError(error);
    }
  }

  /**
   * Commits all queries to the database made within the current transaction
   */
  public async commit(): Promise<void> {
    if (!this.isTransaction) {
      throw new ODBCErrorResult(
        "Could not commit because the ODBC connection is not a transaction."
      );
    }
    try {
      await this.connection?.commit();
    } catch (error) {}
  }

  /**
   * Rolls back all changes made within the current transaction
   */
  public async rollback(): Promise<void> {
    if (!this.isTransaction) {
      throw new ODBCErrorResult(
        "Could not rollback because the odbc connection is not a transaction"
      );
    }
    try {
      await this.connection?.rollback();
    } catch (error) {
      throw transformODBCError(error);
    }
  }

  // Private Methods

  private async executeQuery(
    sql: string,
    parameters?: QueryParameter[]
  ): Promise<any> {
    if (!this.connection)
      throw new Error(`There was no active ODBC connection found.`);
    let query: string = sql;
    try {
      let result: odbc.Result<any>; // Init the result
      // If using custom insert param function, then create the query and get result
      if (this.options.useCustomInsertParams) {
        query = customInsertParams(sql, parameters);
        result = await this.connection.query(query);
      }
      // If using normal insert param function, then get the result
      else {
        result = await this.connection.query(query, parameters as any[]);
      }

      let transformedResult: any = result; // Init the transformed result
      // If trimming white spaces, then transform
      if (this.options.trimEndOfResults) {
        transformedResult = trimEndOfResults(transformedResult);
      }
      return transformedResult;
    } catch (caughtError: any) {
      let message: string =
        caughtError.message ||
        "There was an error executing the query on the odbc connection.";

      const errorQuery = {
        raw: sql,
        parameters: parameters || [],
        formatted: query,
      };
      throw transformODBCError(caughtError, errorQuery, message);
    }
  }

  private setOptions(options?: Options): void {
    if (!options) return;
    this.options = { ...this.options, ...options };
  }
}
