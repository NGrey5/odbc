export function throwODBCError(error: any): void {
  let msg: string = error.message;
  if (error.odbcErrors) {
    error.odbcErrors.forEach((err: any, i: number) => {
      const errStr = `${i + 1}: state: ${err.state} | code: ${
        err.code
      } | message: ${err.message}`;
      msg += `\n\t${errStr}`;
    });
  }
  throw new Error(msg); // Throw the same error message if no odbc error information
}
