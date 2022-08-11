import odbc from "odbc";

/**
 * ### Enum
 *
 * Contains any usable isolation level for an ODBC transaction
 */
export enum ODBCIsolationLevel {
  ReadUncommitted = (odbc as any).SQL_TXN_READ_UNCOMMITTED,
  ReadCommitted = (odbc as any).SQL_TXN_READ_COMMITTED,
  RepeatableRead = (odbc as any).SQL_TXN_REPEATABLE_READ,
  Serializable = (odbc as any).SQL_TXN_SERIALIZABLE,
}
