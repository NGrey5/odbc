import { CreateConnectionConfig } from "../types/ConnectionConfig.interface";
import { DATABASE_CONNECTION_STRING_KEYS } from "../constants";

// Creates a connection string for ODBC with the given options
export function createConnectionStringFromConfig(createConnectionConfig: CreateConnectionConfig): string {
  // If only DSN, return string as DSN
  const { DSN, connectionString } = createConnectionConfig;
  if (DSN) {
    return `DSN=${DSN}`;
  }
  if (connectionString) {
    return connectionString;
  }
  // If connection options, then create the string from the options and return
  const { type = "actianzen", driver, server, database, auth } = createConnectionConfig;
  const { driver_key, server_key, database_key, user_key, password_key } = DATABASE_CONNECTION_STRING_KEYS[type];
  const driverString = `${driver_key}={${driver}}`;
  const serverString = `${server_key}=${server}`;
  const dbNameString = `${database_key}=${database}`;
  const authString = `${user_key}=${auth?.user};${password_key}=${auth?.password}`;

  const strings: string[] = [driverString, serverString, dbNameString];
  if (auth) strings.push(authString);

  return strings.join(";");
}
