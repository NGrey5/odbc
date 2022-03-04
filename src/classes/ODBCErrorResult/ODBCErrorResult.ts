import odbc from "odbc";
import { QueryParameter } from "../../types";

type ODBCError = odbc.OdbcError;

type ODBCErrorQuery = {
  raw: string;
  parameters: QueryParameter[];
  formatted: string;
};

/**
 * This class is the error that is returned from all actions from this odbc package
 * It transforms the odbc.OdbcError object into a class with more information pertaining to the query
 * and allows a message to be provided for improved visibility
 */
export class ODBCErrorResult extends Error {
  errors: ODBCError[] = [];
  query: ODBCErrorQuery;

  constructor(message: string, errors?: ODBCError[], query?: ODBCErrorQuery) {
    super(message);
    this.errors = errors || [];
    this.query = query || { raw: "", parameters: [], formatted: "" };
  }
}
