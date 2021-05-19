import { ODBCConnection } from "../../classes/ODBCConnection/ODBCConnection";
import { CreateConnectionConfig, Options } from "../../types";

export async function createConnection(config: CreateConnectionConfig, options?: Options): Promise<ODBCConnection> {
  const connection = new ODBCConnection();
  await connection.connect(config, options);
  return connection;
}
