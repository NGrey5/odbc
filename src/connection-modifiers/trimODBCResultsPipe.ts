import { ODBCResultPipe } from "../common/types";

/**
 * `ODBCResultPipe` pipes and odbc result, and trims the ends of all row keys that contains a string type
 * @param result ODBCResult
 */
export const trimODBCResultsPipe: ODBCResultPipe = (result) => {
  const rows = [...result.rows];

  for (const row of rows) {
    if (!row) return row;
    if (typeof row !== "object") return row;

    // Loop through each key of the object. If the value of the key is
    // a string; then trim the right hand side of the string and set it as the new value
    for (const key of Object.keys(row)) {
      const k = key as keyof typeof row;
      const v = row[k];
      if (typeof v !== "string") continue;
      (row[k] as unknown as string) = (v as string).trimEnd();
    }
  }

  result.rows = rows;
  return result;
};
