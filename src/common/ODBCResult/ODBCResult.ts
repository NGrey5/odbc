import odbc from "odbc";
import { ODBCQueryParameters } from "../types";

/** The result from an odbc database query or call. Contains the rows of data received along
 * with information pertaining to the query executed.
 */
export class ODBCResult<T = unknown> {
  /** Array containing the result set of the odbc query or call */
  public rows: T[];
  /** The number of database rows affected by the execution.
   *
   * Note: this is not the number of rows returned by the execution.
   */
  public count: number;
  /** The definitions of the fields returned by the execution */
  public fields: odbc.ColumnDefinition[];
  /** The statement executed */
  public statement: string;
  /**
   * The array of parameters passed to the statement or procedure.
   *
   * - For input/output or output parameters on a procedure, this value will
   *   reflect the output values of the procedure
   */
  public parameters: ODBCQueryParameters;
  /** The return value of some procedures. For many DBMS this will always be undefined */
  public return: unknown;

  constructor(result: odbc.Result<T>) {
    const { count, columns, statement, parameters, return: returnVal } = result;
    this.rows = [...result];
    this.count = count;
    this.fields = columns;
    this.statement = statement;
    this.parameters = parameters;
    this.return = returnVal;
  }

  /** The length of the data set array (number of rows) */
  public get length(): number {
    return this.rows.length;
  }
}
