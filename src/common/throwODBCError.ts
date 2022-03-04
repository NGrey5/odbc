import { OdbcError } from "odbc";
import { ODBCErrorResult } from "../classes/ODBCErrorResult/ODBCErrorResult";

/**
 *
 * @param error any error that may occur from an odbc action
 * @param query the query that was attempted, if any
 * @param message the message describing what the error might be
 * @returns ODBCErrorResult
 *
 * Takes in an error / query information and transforms it into ODBCErrorResult
 */
export function transformODBCError(
  error: any,
  query?: ODBCErrorResult["query"],
  message?: string
): ODBCErrorResult {
  let msg = message || "There was an error with the odbc connection";
  const errorResult = new ODBCErrorResult(msg, [], query);
  if (error.odbcErrors) {
    const odbcErrors: OdbcError[] = error.odbcErrors;
    errorResult.errors = odbcErrors;
  }
  return errorResult;
}
