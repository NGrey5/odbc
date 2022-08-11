import path from "path";

const DB_PATH = path.join(__dirname, "../../../sqlite.db");

export const TEST_CONNECTION_STRING = `Driver={SQLite3 ODBC Driver};Database=${DB_PATH}`;
