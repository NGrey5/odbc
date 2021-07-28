import { createConnectionPool } from "..";
import { TESTING_DSN } from "../../../private/constants";
import { ODBCConnectionPool } from "../../classes/ODBCConnectionPool/ODBCConnectionPool";

describe("createConnectionPool", () => {
  it("should create a connection pool", async () => {
    const pool = await createConnectionPool({ DSN: TESTING_DSN });
    expect(pool).toBeInstanceOf(ODBCConnectionPool);
  });
});
