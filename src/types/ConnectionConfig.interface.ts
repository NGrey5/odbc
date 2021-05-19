import { DatabaseType } from "./DatabaseType.type";

export type CreateConnectionConfig = ConnectionConfig | DSNConfig | ConnectionStringConfig;

export interface ConnectionConfig {
  driver: string;
  server: string;
  database: string;
  auth?: {
    user: string;
    password: string;
  };
  type?: DatabaseType;
  DSN?: never;
  connectionString?: never;
}

export interface DSNConfig {
  DSN: string;
  driver?: never;
  server?: never;
  database?: never;
  auth?: never;
  type?: never;
  connectionString?: never;
}

export interface ConnectionStringConfig {
  connectionString: string;
  DSN?: never;
  driver?: never;
  server?: never;
  database?: never;
  auth?: never;
  type?: never;
}
