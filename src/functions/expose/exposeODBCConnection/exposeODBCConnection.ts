import * as odbc from "odbc";

export async function exposeODBCConnection(connectionString: string): Promise<odbc.Connection> {
  const connection = await odbc.connect(connectionString);
  return connection;
}
