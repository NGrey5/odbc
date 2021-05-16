import { ConnectionStringOptions } from "../types/ConnectionStringOptions.interface";
import { DSN } from "../types/DSN.type";

// Creates a connection string for ODBC with the given options
export function getConnectionString(
  odbcConnection: DSN | ConnectionStringOptions
): string {
  // If only DSN, return string as DSN
  if (typeof odbcConnection === "string") {
    return `DSN=${odbcConnection}`;
  }
  // If connection options, then create the string from the options and return
  const { driver, server, dbName, auth } =
    odbcConnection as ConnectionStringOptions;
  const driverString = `Driver={${driver}}`;
  const serverString = `ServerName=${server}`;
  const dbNameString = `DBQ=${dbName}`;
  const authString = `UID=${auth?.user};PWD=${auth?.password}`;

  const strings: string[] = [driverString, serverString, dbNameString];
  if (auth) strings.push(authString);

  return strings.join(";");
}
