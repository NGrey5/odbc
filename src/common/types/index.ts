import odbc from "odbc";
import { ODBCResult } from "../ODBCResult/ODBCResult";

/** Defines the type in which a binding parameter can be */
export type ODBCQueryParameter = string | number;
/** Array of `ODBCQueryParameter` type */
export type ODBCQueryParameters = ODBCQueryParameter[];
type t = odbc.QueryOptions;
/** Options to set on a connection query */
export type ODBCQueryOptions = {
  /** The amount of time (in seconds) that the query will attempt to execute before returning */
  timeout?: odbc.QueryOptions["timeout"];
  /** Sets the intial buffer size (in bytes) for storing data from SQL_LONG* data fields. Useful for avoiding resizes if buffer size is known before the call */
  initialBufferSize?: odbc.QueryOptions["initialBufferSize"];
};
/** Options to set on a cursor */
export type ODBCCursorOptions = ODBCQueryOptions & {
  /** The fetch size of the cursor */
  fetchSize?: odbc.QueryOptions["fetchSize"];
};

/** Options available for `callProcedure` method */
export type ODBCCallProcedureOptions = {
  /** Name of the procedure to call */
  name: string;
  /** Name of the catalog in which the procedure exists. If not provided it will use the default */
  catalog?: string;
  /** Name of the schema in which the procedure exists. If not provided it will use the default */
  schema?: string;
  /** Input and Output parameters to supply to the procedure
   * - `Output Parameters`: any value can be passed in and will be overwritten by the function
   */
  parameters?: ODBCQueryParameters;
};

/** Options available for `tables` method */
export type ODBCTablesOptions = {
  catalog?: string;
  schema?: string;
  table?: string;
  type?: string;
};

/** Options available for `columns` method */
export type ODBCColumnOptions = {
  catalog?: string;
  schema?: string;
  table?: string;
  column?: string;
};

/** Type of a function that pipes an ODBCResult and returns the new value */
export type ODBCResultPipe = (result: ODBCResult<any>) => ODBCResult<any>;
/** Type of a function that pipes an odbc query statement and params and returns the new values */
export type ODBCQueryPipe = (
  statement: string,
  parameters: ODBCQueryParameters
) => { statement: string; parameters: ODBCQueryParameters };
