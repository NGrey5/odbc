import { TESTING_DSN } from "../../../../private/constants";
import { exposeODBCPool } from "./exposeODBCPool";

describe("exposeODBCPool", () => {
  it("should expose a raw odbc pool from the odbc package", async () => {
    const pool = await exposeODBCPool({ connectionString: `DSN=${TESTING_DSN}` });
    expect(pool.close).toBeTruthy();
  });
});
