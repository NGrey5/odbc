import { TESTING_DSN } from "../../../../private/constants";
import { exposeODBCConnection } from "./exposeODBCConnection";

describe("exposeODBConnection", () => {
  it("should expose raw odbc connection from odbc package", async () => {
    const connection = await exposeODBCConnection(`DSN=${TESTING_DSN}`);
    expect(connection.close).toBeTruthy();
  });
});
