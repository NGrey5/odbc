import odbc from "odbc";
import { ODBCConnection } from "../ODBCConnection/ODBCConnection";
import { ODBCModifiedConnection } from "../ODBCConnectionModifier/ODBCConnectionModifier";
import { ODBCError } from "../ODBCError/ODBCError";
import { ODBCResult } from "../ODBCResult/ODBCResult";
import { ODBCQueryParameters } from "../types";

/**
 * Created from an `ODBCConnection`
 *
 * Allows preparing of a commonly used statement and binding parameters to it multiple times.
 */
export class ODBCStatement extends ODBCModifiedConnection {
  private _statement: odbc.Statement;

  constructor(statement: odbc.Statement, connectionRef: ODBCConnection) {
    super(connectionRef["connectionModifier"]);

    this._statement = statement;
  }

  /**
   * Prepares an SQL statement with or without parameters(?) to bind to
   * @param sql the sql query string with or without parameters(?) to be bound
   * @returns this
   */
  public async prepare(sql: string): Promise<this> {
    try {
      await this._statement.prepare(sql);
    } catch (error) {
      throw new ODBCError(error);
    }

    return this;
  }

  /**
   * Binds an array of values to the parameters on the prepared SQL statement created with `prepare`
   * Cannot Be called before `prepare`
   * @param parameters
   * @returns this
   */
  public async bind(parameters: ODBCQueryParameters): Promise<this> {
    try {
      await this._statement.bind(parameters);
    } catch (error) {
      throw new ODBCError(error);
    }

    return this;
  }

  /**
   * Executes the prepared and optionally bound SQL statement
   * @returns result set
   */
  public async execute<T>(): Promise<ODBCResult> {
    try {
      const result = await this._statement.execute<T>();
      return this.connectionModifier.getResultFrom(result);
    } catch (error) {
      throw new ODBCError(error);
    }
  }

  /**
   * Closes the statement, freeing the statement handle. Calling methods after
   * closing will result in an error.
   *
   * Note: this will not close the connection the statement was created from.
   */
  public async close(): Promise<void> {
    try {
      await this._statement.close();
    } catch (error) {
      throw new ODBCError(error);
    }
  }
}
