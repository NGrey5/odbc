import odbc from "odbc";

export interface ODBCResult<T> {
  result: T[];
  count: odbc.Result<T>["count"];
  columns: odbc.Result<T>["columns"];
  statement: odbc.Result<T>["statement"];
  parameters: odbc.Result<T>["parameters"];
  return: odbc.Result<T>["return"] | undefined;
}
