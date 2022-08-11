import odbc from "odbc";
import { ODBCQueryParameters } from "../types";

type ODBCQueryInfo = {
  /** The query before binding parameters */
  statement: string;
  /** The parameters to bind to the sql query */
  parameters: ODBCQueryParameters;
};

const constants = {
  DEFAULT_NAME: "ODBCError",
  DEFAULT_MESSAGE: "An error occurred on the ODBC connection",
};

/**
 * The error class thrown by each action taken on an odbc connection. All errors
 * throw by this package will result in an `ODBCError`
 */
export class ODBCError extends Error {
  private _errors: odbc.OdbcError[] = [];
  private _query: ODBCQueryInfo = {
    statement: "",
    parameters: [],
  };

  /** Information about the query that caused the error */
  public get query(): ODBCQueryInfo {
    return this._query;
  }
  /** The odbc error array containing additional information about each individual error */
  public get errors(): odbc.OdbcError[] {
    return this._errors;
  }

  constructor(error?: unknown, queryInfo?: ODBCQueryInfo) {
    // Set the defaults for the base Error class
    super();
    this.name = constants.DEFAULT_NAME;
    this.message = constants.DEFAULT_MESSAGE;

    // Set the query info if provided
    if (queryInfo) this._query = queryInfo;

    // If the error is already an ODBCError then set it
    if (error instanceof ODBCError) {
      this.name = error.name;
      this.message = error.message;
      this.stack = error.stack;
      this._errors = error.errors;
      this._query = error.query;
      return;
    }
    // If the error is and standard odbc package error then set the
    // error information from it
    // Note: odbc.NodeOdbcError says it's a class, but it's only defined within
    // the `odbc` namespace so we can't use instanceof to check the class
    // We have to first check if it's an object an if it has the odbcErrors property
    if (typeof error === "object" && "odbcErrors" in (error as any)) {
      const { name, stack, odbcErrors, message } = error as odbc.NodeOdbcError;
      this.name = name;
      this.message = message;
      this.stack = stack;
      this._errors = odbcErrors;
      return;
    }

    // If the error is a standard Error, then set the error info from it
    if (error instanceof Error) {
      this.name = error.name;
      this.message = error.message;
      this.stack = error.stack;
      return;
    }

    // If error is just a string, then set the string as the message
    if (typeof error === "string") {
      this.message = error;
      return;
    }
  }
}
