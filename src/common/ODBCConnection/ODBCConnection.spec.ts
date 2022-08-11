import raw from "odbc";
import { TEST_CONNECTION_STRING } from "../../test";
import { ODBCCursor } from "../ODBCCursor/ODBCCursor";
import { ODBCError } from "../ODBCError/ODBCError";
import { ODBCIsolationLevel } from "../ODBCIsolationLevel";
import { ODBCResult } from "../ODBCResult/ODBCResult";
import { ODBCConnection } from "./ODBCConnection";
const constants = {
  CONNECTION_STRING: TEST_CONNECTION_STRING,
};

describe("ODBCConnection", () => {
  let connection: ODBCConnection;

  beforeEach(async () => {
    connection = await ODBCConnection.create(constants.CONNECTION_STRING);
  });

  afterEach(async () => {
    await connection.close();
  });

  it("should create a connection with a given connection string", async () => {
    expect(connection).toBeTruthy();
  });

  it("should throw an error when given an invlid connection string", async () => {
    try {
      const conn = await ODBCConnection.create("invalid");
      conn.close();
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  it("should wrap an existing odbc connection from the odbc package", async () => {
    const existing = await raw.connect(constants.CONNECTION_STRING);
    const conn = new ODBCConnection().wrapConnection(existing);
    expect(conn["_connection"]).toEqual(existing);
    await conn.close();
  });

  it("should close a connection", async () => {
    try {
      await connection.close();
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  it("should return a result from a query", async () => {
    const result = await connection.query(`SELECT '1' as "one"`);
    expect(result.rows[0]).toEqual({ one: "1" });
  });

  it("should return many results from a query", async () => {
    const result = await connection.query(`
        SELECT '1' as "value"
        UNION
        SELECT '2' as "value"
    `);
    expect(result.rows.length === 2);
    expect(result.rows[0]).toEqual({ value: "1" });
    expect(result.rows[1]).toEqual({ value: "2" });
  });

  it("should begin a transaction", async () => {
    try {
      await connection.beginTransaction();
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  it("should begin a transaction with an isolation level", async () => {
    try {
      await connection.beginTransaction(ODBCIsolationLevel.Serializable); // SQLite only allows Serializable
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  it("should commit a transaction", async () => {
    try {
      await connection.beginTransaction();
      await connection.query(`SELECT '1' as "value"`);
      await connection.commit();
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  it("should rollback a transaction", async () => {
    try {
      await connection.beginTransaction();
      await connection.query(`SELECT '1' as "value"`);
      await connection.rollback();
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  it("should return a result from a parameterized query", async () => {
    const query = `
      SELECT * FROM (
        SELECT '1' as "value"
        UNION
        SELECT '2' as "value"
      ) QUERIES
      WHERE "value" = ?
    `;
    try {
      const result = await connection.query(query, ["2"]);
      expect(result.rows.length === 1);
      expect(result.rows[0]).toEqual({ value: "2" });
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  it("should throw an error upon query error", async () => {
    try {
      await connection.query(`bad query`);
    } catch (error) {
      expect(error).toBeInstanceOf(ODBCError);
    }
  });

  // it("should call a procedure", async () => {
  //   const CREATE_STATEMENT = `
  //     CREATE PROCEDURE test(a integer) AS
  //     BEGIN
  //       SELECT '1' as "value";
  //       RETURN 'completed';
  //     END;
  //   `;
  //   const DROP_STATEMENT = `DROP PROCEDURE test`;
  //   try {
  //     await connection.query(CREATE_STATEMENT);
  //     await connection.query(DROP_STATEMENT);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // });

  it("should create a statement", async () => {
    try {
      const stmt = await connection.createStatement();
      await stmt.prepare(`SELECT ? as "value"`);

      // Bind first set of values
      await stmt.bind(["1"]);
      let result = await stmt.execute<{ value: string }>();
      expect(result.rows[0]).toEqual({ value: "1" });

      // Bind second set of values
      await stmt.bind(["2"]);
      result = await stmt.execute<{ value: string }>();
      expect(result.rows[0]).toEqual({ value: "2" });
      await stmt.close();
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  it("should get table information", async () => {
    try {
      const result = await connection.tables();
      expect(result).toBeInstanceOf(ODBCResult);
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  it("should get table information", async () => {
    try {
      const result = await connection.columns();
      expect(result).toBeInstanceOf(ODBCResult);
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  it("should get a cursor", async () => {
    let cursor: ODBCCursor | undefined = undefined;
    try {
      cursor = await connection.cursor(`SELECT '1' as "one"`);
      expect(cursor).toBeInstanceOf(ODBCCursor);
      await cursor.close();
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  it("should fetch through a cursor", async () => {
    const sql = `
    SELECT * FROM (
      SELECT '1' as "value"
      UNION
      SELECT '2' as "value"
    ) Q
  `;
    try {
      const cursor = await connection.cursor<any>(sql, [], { fetchSize: 1 });
      let result = await cursor.fetch();
      expect(result.rows[0]).toEqual({ value: "1" });
      result = await cursor.fetch();
      expect(result.rows[0]).toEqual({ value: "2" });
      await cursor.fetch();
      expect(cursor.noData()).toBeTruthy();
      await cursor.close();
    } catch (error) {
      expect(error).toBeFalsy();
    }
  });

  it("should read through a cursor", async () => {
    const sql = `
    SELECT * FROM (
      SELECT '1' as "value"
      UNION
      SELECT '2' as "value"
    ) Q
  `;
    const cursor = await connection.cursor<any>(sql, [], { fetchSize: 1 });
    let i = 0;
    await cursor.read((result, error) => {
      i++;
      if (i === 1) expect(result.rows[0]).toEqual({ value: "1" });
      if (i === 2) expect(result.rows[0]).toEqual({ value: "2" });
    });
    expect(i).toEqual(2);
  });

  it("should throw an error when reading a bad cursor", async () => {
    const sql = `bad query`;
    try {
      await connection.cursor<any>(sql, [], { fetchSize: 1 });
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });
});
