import odbc from "odbc";
import { ODBCConnection } from "../ODBCConnection/ODBCConnection";
import { ODBCModifiedConnection } from "../ODBCConnectionModifier/ODBCConnectionModifier";
import { ODBCError } from "../ODBCError/ODBCError";
import { ODBCResult } from "../ODBCResult/ODBCResult";

// Defines the base odbc package cursor object due to
// no typing provided from the package
interface CursorDefinition<T> {
  fetch: (
    callback?: (error: unknown, result: odbc.Result<T>) => void
  ) => Promise<odbc.Result<T>>;
  noData: boolean;
  close: () => Promise<void>;
}

/**
 * Cursor created from and `ODBCConnection` used to retrieve partial data from
 * an overarching dataset that would normally be returned from the entire query
 */
export class ODBCCursor<T = unknown> extends ODBCModifiedConnection {
  private _cursor: CursorDefinition<T>;

  /**
   * Static method to determine if the object is a cursor object that
   * can be used to instantiate the `ODBCCursor` class
   * @param cursor cursor object from the standard `odbc` package
   * @returns boolean
   */
  public static isCursor(cursor: any): boolean {
    if (!!!cursor) return false;
    if (typeof cursor !== "object") return false;
    if ("fetch" in cursor && "noData" in cursor && "close" in cursor)
      return true;
    return false;
  }

  constructor(cursor: any, connectionRef: ODBCConnection) {
    super(connectionRef["connectionModifier"]);

    if (!ODBCCursor.isCursor(cursor))
      throw new ODBCError("ODBC Cursor could not be created");

    this._cursor = cursor;
  }

  /**
   * Fetches a data of length specified by the `fetchSize` set on the cursor. If no
   * data is remaining it will return an empty array
   * @returns data set
   */
  public async fetch(): Promise<ODBCResult<T>> {
    try {
      const result = await this._cursor.fetch();
      return this.connectionModifier.getResultFrom(result);
    } catch (error) {
      throw new ODBCError(error);
    }
  }

  /**
   * If the cursor has no data remaining to fetch. Cannot return true unless `fetch`
   * has been called at least once.
   * @returns boolean
   */
  public noData(): boolean {
    try {
      return this._cursor.noData;
    } catch (error) {
      throw new ODBCError(error);
    }
  }

  /** Closes the cursor */
  public async close(): Promise<void> {
    try {
      return this._cursor.close();
    } catch (error) {
      throw new ODBCError(error);
    }
  }

  /**
   * Reads each result set with `fetch` and returns the result to the callback function supplied.
   * @param callback callback function to invoke on each result set retrieved from the cursor
   * @returns
   */
  public async read(
    callback: (result: ODBCResult<T>, error: ODBCError | undefined) => void
  ): Promise<void> {
    while (!this.noData()) {
      try {
        const result = await this.fetch();
        if (this.noData()) break;
        callback(result, undefined);
      } catch (error) {
        callback(new ODBCResult([] as any), error as ODBCError);
      }
    }
    await this.close();
    return;
  }
}
