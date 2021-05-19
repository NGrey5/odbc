import { TESTING_DSN } from "../../../private/constants";
import { ODBCConnection } from "../ODBCConnection/ODBCConnection";
import { ODBCConnectionPool } from "../ODBCConnectionPool";

describe("ODBCConnectionPool", () => {
  let testPool: ODBCConnectionPool;

  beforeEach(async () => {
    testPool = new ODBCConnectionPool();
    await testPool.create({ DSN: TESTING_DSN });
  });

  afterEach(() => {
    testPool.close();
  });

  it("should create a database pool", async () => {
    expect(testPool).toBeTruthy();
  });

  it("should return a connection from the pool", async () => {
    const conn = await testPool.getConnection();
    expect(conn).toBeInstanceOf(ODBCConnection);
  });

  it("should close a pool", async () => {
    const spy = spyOn<any>(testPool, "close");
    await testPool.close();

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
