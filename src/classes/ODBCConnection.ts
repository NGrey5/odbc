import odbc from "odbc";
import { DEFAULT_OPTIONS } from "../constants";
import { getConnectionString } from "../functions";
import { ConnectionStringOptions } from "../types/ConnectionStringOptions.interface";
import { DSN } from "../types/DSN.type";
import { Options } from "../types/Options.interface";

export class ODBCConnection {
  private connection: odbc.Connection | undefined;
  private options: Options = DEFAULT_OPTIONS;

  constructor() {}

  // Connection

  public useExistingConnection(connection: odbc.Connection, options?: Options) {
    this.connection = connection;
    this.setOptions(options);
  }

  public async create(
    connectionStringOptions: DSN | ConnectionStringOptions,
    options?: Options
  ): Promise<void> {
    const connectionString = getConnectionString(connectionStringOptions);
    this.connection = await odbc.connect(connectionString);
    this.setOptions(options);
  }

  // Query

  public async query<T = any>(sql: string, parameters?: any[]): Promise<T[]> {
    return this.queryMany<T>(sql, parameters);
  }

  public async queryOne<T = any>(sql: string, parameters?: any[]): Promise<T> {
    const result: T[] = await this.executeQuery(sql, parameters);
    return result[0];
  }

  public async queryMany<T = any>(
    sql: string,
    parameters?: any[]
  ): Promise<T[]> {
    const result: T[] = await this.executeQuery(sql, parameters);
    return result;
  }

  public async close(): Promise<void> {
    await this.connection?.close();
    this.connection === undefined;
  }

  // Transaction

  public async beginTransaction(): Promise<void> {
    if (!this.connection)
      throw new Error(
        `Could not begin the transaction. There was no active ODBC connection found.`
      );
    this.connection.beginTransaction();
  }

  public async commit(): Promise<void> {
    this.connection?.commit();
  }

  public async rollback(): Promise<void> {
    this.connection?.rollback();
  }

  // Private Methods

  private async executeQuery(sql: string, parameters?: any[]): Promise<any> {
    if (!this.connection)
      throw new Error(`There was no active ODBC connection found.`);
    let query: string = "";
    try {
      let result: odbc.Result<any>; // Init the result
      // If using custom insert param function, then create the query and get result
      if (this.options.useCustomInsertParams) {
        query = this.customInsertParameters(sql, parameters);
        result = await this.connection.query(query);
      }
      // If using normal insert param function, then get the result
      else {
        result = await this.connection.query(query, parameters);
      }

      let transformedResult: any = result; // Init the transformed result
      // If trimming white spaces, then transform
      if (this.options.trimWhiteSpacesFromResult) {
        transformedResult = this.trimResultWhitespaces(transformedResult);
      }
      return transformedResult;
    } catch (error) {
      const message = error.message;
      const odbcErrors = error.odbcErrors.map(
        (odbcError: any, i: number) => `${i + 1}: ${odbcError.message}`
      );
      console.log(
        "\x1b[31m%s\x1b[0m",
        "There were errors executing the odbc sql query. Refer to the details below:\n"
      );
      console.log("\x1b[31m%s\x1b[0m", "Message:");
      console.log(message);
      console.log("\x1b[31m%s\x1b[0m", "ODBC Errors:");
      console.log(odbcErrors.join("\n"));
      console.log("\x1b[31m%s\x1b[0m", "SQL:");
      console.log(sql);
      console.log("\x1b[31m%s\x1b[0m", "Parameters:");
      console.log(parameters || []);
      console.log("\x1b[31m%s\x1b[0m", "Query:");
      console.log(query + "\n");

      throw new Error(
        error.odbcErrors[0].message || "There was an error executing the query."
      );
    }
  }

  private setOptions(options?: Options): void {
    if (!options) return;
    this.options = { ...this.options, ...options };
  }

  private customInsertParameters(sql: string, parameters?: any[]): string {
    if (!parameters || !parameters.length) return sql; // If no parameters, just return the sql provided

    // Check that the number of provided params equals the number of expected params
    const countProvidedParams = parameters.length; // The amount of parameters given
    const countExpectedParams = (sql.match(/\?/g) || []).length; // Count all '?' in the sql string
    if (countExpectedParams !== countProvidedParams)
      throw new Error(
        `Expected ${countExpectedParams} parameters but got ${countProvidedParams}`
      );

    // Loop through the parameters and excape all single quotes
    const params = parameters.map((param) => {
      if (typeof param !== "string") return param; // If not string just return the param
      return param.replace(/'/g, "''"); // Return the string with single quotes escaped
    });

    // Replace all '?' in the sql statement with the provided params
    // Add single quotes around the param if it's a string
    const newSql = sql.replace(/\?/g, () => {
      let replacement = parameters[0]; // Set the replacement to the first param
      parameters.shift(); // Remove the param from the array
      if (typeof replacement === "string") replacement = `'${replacement}'`;
      return replacement;
    });

    return newSql;
  }

  private trimResultWhitespaces(
    dbResult: Record<string, any>[]
  ): Record<string, any>[] {
    const trimmed = [...dbResult];
    trimmed.forEach((row: any) => {
      Object.keys(row).map((key) => {
        if (typeof row[key] === "string") row[key] = row[key].trim();
      });
    });
    return trimmed;
  }
}
