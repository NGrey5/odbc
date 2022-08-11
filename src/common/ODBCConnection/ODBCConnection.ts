import * as odbc from "odbc";
import { ODBCModifiedConnection } from "../ODBCConnectionModifier/ODBCConnectionModifier";
import { ODBCCursor } from "../ODBCCursor/ODBCCursor";
import { ODBCError } from "../ODBCError/ODBCError";
import { ODBCResult } from "../ODBCResult/ODBCResult";
import { ODBCStatement } from "../ODBCStatement/ODBCStatement";
import {
  ODBCCallProcedureOptions,
  ODBCColumnOptions,
  ODBCCursorOptions,
  ODBCQueryOptions,
  ODBCQueryParameters,
  ODBCTablesOptions,
} from "../types";

/** Creates an ODBC database connection class asynchronously */
export async function createODBCConnection(
  connectionString: string
): Promise<ODBCConnection> {
  return ODBCConnection.create(connectionString);
}

/**
 * An odbc connection wrapper for the standard `odbc` package.
 * All methods that reside within this class return promises instead of the standard callback implementation.
 * Implements strict typing on all methods for ease of use
 */
export class ODBCConnection extends ODBCModifiedConnection {
  private _connection: odbc.Connection | undefined;

  constructor() {
    super();
  }

  /** Shorthand static method for creating a new ODBCConnection class and using the `connect` method */
  public static async create(
    connectionString: string
  ): Promise<ODBCConnection> {
    return new ODBCConnection().connect(connectionString);
  }

  /** Opens a new ODBC connection with the provided config */
  public async connect(connectionString: string): Promise<this> {
    this._connection = await odbc.connect(connectionString);
    return this;
  }

  /**
   * Wraps and existing odbc connection from the standard `odbc` package in it's ODBCConnection class representation
   * @usage
   * ```ts
   *  import odbc from "odbc"
   *
   *  const connection = odbc.connect(CONNECTION_STRING);
   *  const wrapper = new ODBCConnection().wrapConnection(connection);
   * ```
   * */
  public wrapConnection(connection: odbc.Connection): this {
    if (this._connection) this._connection.close(); // Close any existing connection
    this._connection = connection;
    return this;
  }

  /**
   * Queries the odbc connection and returns an odbc result
   * @param sql sql statement with optional parameters(?) to bind to
   * @param parameters an array of values to bind to the sql parameters(?)
   * @param options query options
   * @returns result set
   */
  public async query<T = unknown>(
    statement: string,
    parameters: ODBCQueryParameters = [],
    options: ODBCQueryOptions = {}
  ): Promise<ODBCResult<T>> {
    if (!this._connection)
      throw new ODBCError("No active ODBC connection found.");
    try {
      const query = this.connectionModifier.getQueryFrom(statement, parameters);
      const result = await this._connection.query<T>(
        query.statement,
        query.parameters,
        options
      );
      return this.connectionModifier.getResultFrom(result);
    } catch (error) {
      throw new ODBCError(error, { statement, parameters });
    }
  }

  /**
   * Calls a procedure defined on the database
   * @param options call procedure options
   * @returns
   */
  public async callProcedure<T = unknown>(
    options: ODBCCallProcedureOptions
  ): Promise<ODBCResult<T>> {
    if (!this._connection)
      throw new ODBCError("No active ODBC connection found");
    try {
      const catalog: any = options.catalog ?? null;
      const schema: any = options.schema ?? null;
      const name = options.name;
      const parameters = options.parameters;
      const result = (await this._connection.callProcedure(
        catalog,
        schema,
        name,
        parameters
      )) as odbc.Result<T>;
      return this.connectionModifier.getResultFrom(result);
    } catch (error) {
      throw new ODBCError(error);
    }
  }

  /**
   * Creates and returns an odbc statement
   * @returns ODBCStatement
   */
  public async createStatement(): Promise<ODBCStatement> {
    if (!this._connection)
      throw new ODBCError("No active ODBC connection found.");

    try {
      const statement = await this._connection.createStatement();
      const stmtClass = new ODBCStatement(statement, this);
      return stmtClass;
    } catch (error) {
      throw new ODBCError(error);
    }
  }

  /**
   * Returns the table information specified in `options`
   *
   * Note: The data set is typed as `unknown` as the result will change depending on the
   * odbc driver and database used.
   * @param options table retrievable options
   * @returns
   */
  public async tables(
    options: ODBCTablesOptions = {}
  ): Promise<ODBCResult<unknown>> {
    if (!this._connection)
      throw new ODBCError("No active ODBC connection found.");

    try {
      const catalog: any = options.catalog ?? null;
      const schema: any = options.schema ?? null;
      const table: any = options.table ?? null;
      const type: any = options.type ?? null;
      const result = await this._connection.tables(
        catalog as string,
        schema as string,
        table as string,
        type as string
      );
      return this.connectionModifier.getResultFrom(result);
    } catch (error) {
      throw new ODBCError(error);
    }
  }

  /**
   * Returns the column information specified in `options`
   *
   * Note: The data set is typed as `unknown` as the result will change depending on the
   * odbc driver and database used.
   * @param options column retrievable options
   * @returns
   */
  public async columns(
    options: ODBCColumnOptions = {}
  ): Promise<ODBCResult<unknown>> {
    if (!this._connection)
      throw new ODBCError("No active ODBC connection found");

    try {
      const catalog: any = options.catalog ?? null;
      const schema: any = options.schema ?? null;
      const table: any = options.table ?? null;
      const column: any = options.column ?? null;
      const result = await this._connection.columns(
        catalog as string,
        schema as string,
        table as string,
        column as string
      );
      return this.connectionModifier.getResultFrom(result);
    } catch (error) {
      throw new ODBCError(error);
    }
  }

  /**
   * Creates and returns a new database cursor
   * @param sql sql statement with optional parameters(?) to bind to
   * @param parameters array of values to bind to the sql parameters(?)
   * @param options cursor options
   * @returns ODBCCursor
   */
  public async cursor<T = unknown>(
    statement: string,
    parameters: ODBCQueryParameters = [],
    options: ODBCCursorOptions = {}
  ): Promise<ODBCCursor<T>> {
    if (!this._connection)
      throw new ODBCError("No active ODBC connection found.");
    try {
      const query = this.connectionModifier.getQueryFrom(statement, parameters);
      const cursor: any = await this._connection.query<T>(
        query.statement,
        query.parameters,
        {
          cursor: true,
          ...options,
        }
      );
      return new ODBCCursor(cursor, this);
    } catch (error) {
      throw new ODBCError(error, { statement, parameters });
    }
  }

  /**
   * Sets the isolation level of the connection. Can use either `number` definition
   * or the preset definitions found in `ODBCIsolationLevel` constant
   * @param level isolation level value
   */
  public async setIsolationLevel(level: number): Promise<void> {
    try {
      this._connection?.setIsolationLevel(level);
    } catch (error) {
      throw new ODBCError(error);
    }
  }

  /** Opens a transaction on the connection.
   * - Commit the transaction by calling the `commit` method
   * - Rollback the transaction by calling the `rollback` method
   * - Any uncommitted changes on the transaction will be rolled back upon closing the connection.
   * - Isolation level for the transaction can be set by providing the isolation level to the method, or calling `setIsolationLevel` method on the connection
   */
  public async beginTransaction(isolationLevel?: number): Promise<void> {
    if (isolationLevel) this.setIsolationLevel(isolationLevel);
    try {
      this._connection?.beginTransaction();
    } catch (error) {
      throw new ODBCError(error);
    }
  }

  /** Commits the changes made on an open transaction. If no transaction is open this method will do nothing. */
  public async commit(): Promise<void> {
    try {
      await this._connection?.commit();
    } catch (error) {
      throw new ODBCError(error);
    }
  }

  /** Rolls back the changes made on an open transaction. If no transaction is open this method will do nothing. */
  public async rollback(): Promise<void> {
    try {
      await this._connection?.rollback();
    } catch (error) {
      throw new ODBCError(error);
    }
  }

  /** Closes the current connection. If a transaction is in progress, it will automatically call `rollback` */
  public async close(): Promise<void> {
    try {
      await this._connection?.close();
      this._connection = undefined;
    } catch (error) {
      throw new ODBCError(error);
    }
  }
}
