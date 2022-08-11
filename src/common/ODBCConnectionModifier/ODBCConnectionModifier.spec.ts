import { TEST_CONNECTION_STRING } from "../../test";
import { ODBCPool } from "../ODBCPool/ODBCPool";
import { ODBCResult } from "../ODBCResult/ODBCResult";
import { ODBCConnectionModifier } from "./ODBCConnectionModifier";

describe("ODBCConnectionModifier", () => {
  it("should pipe a result for all classes that implement a result pipe", async () => {
    const QUERY = `SELECT 'before' as "value"`;
    const EXPECTED_RESULT = { value: "after" };
    const RESULT_MAPPER = <T>(r: ODBCResult<T>) => {
      r.rows = [EXPECTED_RESULT] as any;
      return r;
    };

    const resultModifier = new ODBCConnectionModifier({
      resultPipes: [(r) => RESULT_MAPPER(r)],
    });

    const pool = await ODBCPool.create({
      connectionString: TEST_CONNECTION_STRING,
    });
    pool.useConnectionModifier(resultModifier);

    const conn = await pool.connect();
    const cursor = await conn.cursor(QUERY);
    const statement = await conn.createStatement();

    try {
      let result = await pool.query(QUERY);
      expect(result.rows[0]).toEqual(EXPECTED_RESULT);
      result = await conn.query(QUERY);
      expect(result.rows[0]).toEqual(EXPECTED_RESULT);
      result = await cursor.fetch();
      expect(result.rows[0]).toEqual(EXPECTED_RESULT);
      await statement.prepare(QUERY);
      await statement.bind([]);
      result = await statement.execute();
      expect(result.rows[0]).toEqual(EXPECTED_RESULT);
    } catch (error) {
      expect(error).toBeFalsy();
    }
    await cursor.close();
    await statement.close();
    await conn.close();
    await pool.close();
  });

  it("should pipe a query for all classes that implement a query pipe", async () => {
    const QUERY = `bad query`;
    const NEW_QUERY = `SELECT 'after' as "value"`;
    const EXPECTED_RESULT = { value: "after" };

    const queryModifier = new ODBCConnectionModifier({
      queryPipes: [() => ({ statement: NEW_QUERY, parameters: [] })],
    });

    const pool = await ODBCPool.create({
      connectionString: TEST_CONNECTION_STRING,
    });
    pool.useConnectionModifier(queryModifier);

    const conn = await pool.connect();
    const cursor = await conn.cursor(QUERY);
    try {
      let result = await pool.query(QUERY);
      expect(result.rows[0]).toEqual(EXPECTED_RESULT);
      result = await conn.query(QUERY);
      expect(result.rows[0]).toEqual(EXPECTED_RESULT);
      result = await cursor.fetch();
      expect(result.rows[0]).toEqual(EXPECTED_RESULT);
    } catch (error) {
      expect(error).toBeFalsy();
    }
    await cursor.close();
    await conn.close();
    await pool.close();
  });
});
