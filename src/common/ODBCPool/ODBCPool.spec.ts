import { TEST_CONNECTION_STRING } from "../../test/index";
import { ODBCConnection } from "../ODBCConnection/ODBCConnection";
import { ODBCPool } from "./ODBCPool";

describe("ODBCPool", () => {
  let pool: ODBCPool;

  beforeEach(async () => {
    pool = await ODBCPool.create({
      connectionString: `${TEST_CONNECTION_STRING}`,
    });
  });

  afterEach(async () => {
    await pool.close();
  });

  it("should create an odbc pool", async () => {
    expect(pool).toBeTruthy();
  });

  it("should return a connection from the pool", async () => {
    const conn = await pool.connect();
    expect(conn).toBeInstanceOf(ODBCConnection);
    await conn.close();
  });

  it("should get data from a connection retrieve from the pool", async () => {
    const conn = await pool.connect();
    const result = await conn.query(`SELECT '1' as "value"`);
    expect(result.rows[0]).toEqual({ value: "1" });
    await conn.close();
  });

  it("should shorthand query the pool", async () => {
    const result = await pool.query(`SELECT '1' as "value"`);
    expect(result.rows[0]).toEqual({ value: "1" });
  });

  it("should close an odbc pool", async () => {
    try {
      await pool.close();
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });
});
