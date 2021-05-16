export interface ConnectionStringOptions {
  driver: string;
  server: string;
  dbName: string;
  auth?: {
    user: string;
    password: string;
  };
  pool?: boolean;
}
