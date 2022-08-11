import odbc from "odbc";
import { ODBCResult } from "../ODBCResult/ODBCResult";
import { ODBCQueryParameters, ODBCQueryPipe, ODBCResultPipe } from "../types";

/** Options to apply to an `ODBCConnectionModifier` */
export type ODBCConnectionModifierOptions = {
  resultPipes?: ODBCResultPipe[];
  queryPipes?: ODBCQueryPipe[];
};

/**
 * A modifier for any type of ODBC connection. A modifier can be specific to
 * a pool, connection, cursor, or statement.
 *
 * - If a modifier is applied to a pool, it will be applied to all connections on that pool
 * - If a modifier is applied to a connection, it will be applied to actions on that connection
 */
export class ODBCConnectionModifier {
  constructor(private options: ODBCConnectionModifierOptions = {}) {}

  /**
   * Parses an odbc result and returns any transformations specified by the modifier
   */
  public getResultFrom<T>(result: odbc.Result<T>): ODBCResult<T> {
    let r = new ODBCResult(result);
    const pipes = this.options.resultPipes ?? [];

    if (pipes.length === 0) return r;

    for (const pipe of pipes) {
      r = pipe(r);
    }
    return r;
  }

  /**
   * Parses an odbc query and returns and transformations specified by the modifier
   */
  public getQueryFrom(
    statement: string,
    parameters: ODBCQueryParameters
  ): ReturnType<ODBCQueryPipe> {
    let r: ReturnType<ODBCQueryPipe> = { statement, parameters };
    const pipes = this.options.queryPipes ?? [];

    if (pipes.length === 0) return r;

    for (const pipe of pipes) {
      r = pipe(r.statement, r.parameters);
    }
    return r;
  }
}

/**
 * Any odbc connection object can and should extend this class.
 * Denotes that a connection has modifiers associated with it
 */
export abstract class ODBCModifiedConnection {
  constructor(
    protected connectionModifier: ODBCConnectionModifier = new ODBCConnectionModifier()
  ) {}

  public useConnectionModifier(modifier: ODBCConnectionModifier): this {
    this.connectionModifier = modifier;
    return this;
  }
}
