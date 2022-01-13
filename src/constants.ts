import * as odbc from "odbc";
import { Options, DatabaseType } from "./types";

export const DEFAULT_OPTIONS: Options = {
  trimEndOfResults: true,
  useCustomInsertParams: true,
};

type DatabaseConnectionStringKeys = {
  driver_key: string;
  server_key: string;
  database_key: string;
  user_key: string;
  password_key: string;
};

export const DATABASE_CONNECTION_STRING_KEYS: Record<
  DatabaseType,
  DatabaseConnectionStringKeys
> = {
  actianzen: {
    driver_key: "Driver",
    server_key: "ServerName",
    database_key: "DBQ",
    user_key: "UID",
    password_key: "PWD",
  },
  mysql: {
    driver_key: "DRIVER",
    server_key: "SERVER",
    database_key: "DATABASE",
    user_key: "USER",
    password_key: "PASSWORD",
  },
  pg: {
    driver_key: "DRIVER",
    server_key: "SERVER",
    database_key: "DATABASE",
    user_key: "UID",
    password_key: "PWD",
  },
  mssql: {
    driver_key: "DRIVER",
    server_key: "SERVER",
    database_key: "DATABASE",
    user_key: "UID",
    password_key: "PWD",
  },
};

export const ISOLATION_LEVEL = {
  READ_UNCOMMITTED: (odbc as any).SQL_TXN_READ_UNCOMMITTED as number,
  READ_COMMITTED: (odbc as any).SQL_TXN_READ_COMMITTED as number,
  REPEATABLE_READ: (odbc as any).SQL_TXN_REPEATABLE_READ as number,
  SERIALIZABLE: (odbc as any).SQL_TXN_SERIALIZABLE as number,
};
