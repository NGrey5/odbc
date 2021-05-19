import * as odbc from "odbc";
import { PoolConfig } from "../types";
import { exposeODBCConnection } from "./expose/exposeODBCConnection/exposeODBCConnection";
import { exposeODBCPool } from "./expose/exposeODBCPool/exposeODBCPool";

export * from "./createConnection/createConnection";

export * from "./createConnectionPool/createConnectionPool";

export const expose = {
  odbcConnection: (connectionString: string) => exposeODBCConnection(connectionString),
  odbcPool: (config: PoolConfig & { connectionString: string }) => exposeODBCPool(config),
};
