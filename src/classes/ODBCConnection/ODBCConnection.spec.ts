import {
  TESTING_DBNAME,
  TESTING_DRIVER,
  TESTING_DSN,
  TESTING_SERVER,
} from "../../../private/constants";
import { DEFAULT_OPTIONS } from "../../constants";
import { expose } from "../../functions";
import { ODBCResult } from "../../types";
import { ODBCConnection } from "./ODBCConnection";

describe("ODBCConnection", () => {
  let testConn: ODBCConnection;

  beforeEach(async () => {
    testConn = new ODBCConnection();
    await testConn.connect({ DSN: TESTING_DSN });
  });

  afterEach(() => {
    testConn.close();
  });

  it("should create a connection when given a valid connection string, DSN, or options", async () => {
    const conn = new ODBCConnection();
    try {
      await conn.connect({ DSN: TESTING_DSN });
      expect(conn).toBeTruthy();
    } catch (error) {
      throw new Error(error);
    }
    try {
      await conn.connect({
        connectionString: `Driver={${TESTING_DRIVER}};ServerName=${TESTING_SERVER};DBQ=${TESTING_DBNAME}`,
      });
    } catch (error) {
      throw new Error(error);
    }
    try {
      await conn.connect({
        driver: TESTING_DRIVER,
        server: TESTING_SERVER,
        database: TESTING_DBNAME,
      });
    } catch (error) {
      throw new Error(error);
    }

    conn.close();
  });

  it("should throw an error when given an invalid connection string, DSN, or options", async () => {
    const conn = new ODBCConnection();
    try {
      await conn.connect({ DSN: "INVALID" });
    } catch (error) {
      expect(error.errors).toBeTruthy();
    }
    try {
      await conn.connect({
        connectionString: ``,
      });
    } catch (error) {
      expect(error.errors).toBeTruthy();
    }
    try {
      await conn.connect({ driver: "", server: "", database: "" });
    } catch (error) {
      expect(error.errors).toBeTruthy();
    }
    conn.close();
  });

  it("should use an existing raw odbc connection", async () => {
    const existing = await expose.odbcConnection(`DSN=${TESTING_DSN}`);
    const conn = new ODBCConnection();
    conn.useExistingConnection(existing);
    expect(conn["connection"]).toEqual(existing);
    conn.close();
  });

  it("should set the default options", async () => {
    const conn = new ODBCConnection();
    await conn.connect({ DSN: TESTING_DSN });
    expect(conn["options"]).toEqual(DEFAULT_OPTIONS);
    conn.close();
  });

  it("should set the options", async () => {
    const conn = new ODBCConnection();
    const spy = spyOn<any>(conn, "setOptions").and.callThrough();

    await conn.connect(
      { DSN: TESTING_DSN },
      { trimEndOfResults: false, useCustomInsertParams: false }
    );

    expect(spy).toHaveBeenCalledTimes(1);
    expect(conn["options"]).toEqual({
      trimEndOfResults: false,
      useCustomInsertParams: false,
    });
    conn.close();
  });

  it("should close a connection", async () => {
    const conn = new ODBCConnection();
    await conn.connect({ DSN: TESTING_DSN });
    const raw = conn["connection"];
    const spy = spyOn<any>(raw, "close").and.callThrough();
    await conn.close();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("should query and return all values using query", async () => {
    const spy = spyOn(testConn, "queryMany").and.returnValue(
      Promise.resolve([])
    );
    const result = await testConn.query("test", [1]);
    expect(result).toEqual([]);
    expect(spy).toHaveBeenCalledWith("test", [1]);
  });

  it("should query and return one value using queryOne", async () => {
    const mock = { result: [{ test: 1 }, { test: 2 }] };
    const spy = spyOn<any>(testConn, "executeQuery").and.returnValue(
      Promise.resolve(mock)
    );
    const result = await testConn.queryOne("test", [1]);
    expect(result).toEqual({ test: 1 });
    expect(spy).toHaveBeenCalledWith("test", [1]);
  });

  it("should query and return all values using queryMany", async () => {
    const mock = { result: [{ test: 1 }, { test: 2 }] };
    const spy = spyOn<any>(testConn, "executeQuery").and.returnValue(
      Promise.resolve(mock)
    );
    const result = await testConn.queryMany("test", [1]);
    expect(result).toEqual(mock.result);
    expect(spy).toHaveBeenCalledWith("test", [1]);
  });

  it("should return an odbc result from execute", async () => {
    const mock: ODBCResult<any> = {
      result: [{ test: 1 }],
      columns: [
        {
          name: "test",
          dataType: 1,
          columnSize: 1,
          decimalDigits: 1,
          nullable: false,
        },
      ],
      count: 1,
      parameters: [],
      return: undefined,
      statement: "MY STATEMENT",
    };
    const spy = spyOn<any>(testConn, "executeQuery").and.returnValue(
      Promise.resolve(mock)
    );
    const result = await testConn.execute("test", [1]);
    expect(result.result).toEqual([{ test: 1 }]);
    expect(result.count).toEqual(1);
    expect(result.parameters).toEqual([]);
    expect(result.statement).toEqual("MY STATEMENT");
    expect(spy).toHaveBeenCalledWith("test", [1]);
  });

  it("should begin a transaction", async () => {
    const raw = testConn["connection"];
    const spy = spyOn<any>(raw, "beginTransaction");
    await testConn.beginTransaction();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("should commit a transaction", async () => {
    const raw = testConn["connection"];
    const spy = spyOn<any>(raw, "commit");
    await testConn.beginTransaction();
    await testConn.commit();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("should throw an error when trying to commit when not a transaction", async () => {
    try {
      await testConn.commit();
    } catch (error) {
      expect(error.errors).toBeTruthy();
    }
  });

  it("should rollback a transaction", async () => {
    const raw = testConn["connection"];
    const spy = spyOn<any>(raw, "rollback");
    await testConn.beginTransaction();
    await testConn.rollback();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("should throw an error when trying to rollback when not a transaction", async () => {
    try {
      await testConn.rollback();
    } catch (error) {
      expect(error.errors).toBeTruthy();
    }
  });

  it("should execute a normal query", async () => {
    const raw = testConn["connection"];
    const rawConnSpy = spyOn<any>(raw, "query").and.returnValue(
      Promise.resolve([{ test: "5   " }])
    );

    const query = `SELECT * FROM TEST WHERE "test" = 'test'`;
    const result = await testConn["executeQuery"](query);
    expect(result.result).toEqual([{ test: "5" }]);
    expect(rawConnSpy).toHaveBeenCalledWith(query);
  });

  it("should execute a normal query with params", async () => {
    const raw = testConn["connection"];
    const rawConnSpy = spyOn<any>(raw, "query").and.returnValue(
      Promise.resolve([{ test: "5   " }])
    );

    const query = `SELECT * FROM TEST WHERE "test" = ? AND "test2" = ?`;
    const result = await testConn["executeQuery"](query, [1, "val"]);
    expect(result.result).toEqual([{ test: "5" }]);
    expect(rawConnSpy).toHaveBeenCalledWith(
      `SELECT * FROM TEST WHERE "test" = 1 AND "test2" = 'val'`
    );
  });

  it("should execute a query and not trim", async () => {
    const conn = new ODBCConnection();
    await conn.connect({ DSN: TESTING_DSN }, { trimEndOfResults: false });

    const raw = conn["connection"];
    const rawConnSpy = spyOn<any>(raw, "query").and.returnValue(
      Promise.resolve([{ test: "5   " }])
    );

    const query = `SELECT * FROM TEST WHERE "test" = 'test'`;
    const result = await conn["executeQuery"](query);
    expect(rawConnSpy).toHaveBeenCalledWith(query);
    expect(result.result).toEqual([{ test: "5   " }]);
    conn.close();
  });

  it("should execute query with regular param function", async () => {
    const conn = new ODBCConnection();
    await conn.connect({ DSN: TESTING_DSN }, { useCustomInsertParams: false });

    const raw = conn["connection"];
    const rawConnSpy = spyOn<any>(raw, "query").and.returnValue(
      Promise.resolve([{ test: "5" }])
    );

    const query = `SELECT * FROM TEST WHERE "test" = ?`;
    const result = await conn["executeQuery"](query, ["val"]);
    expect(result.result).toEqual([{ test: "5" }]);
    expect(rawConnSpy).toHaveBeenCalledWith(query, ["val"]);

    conn.close();
  });

  it("should show error upon query error", async () => {
    const raw = testConn["connection"];
    const rawConnSpy = spyOn<any>(raw, "query").and.throwError("Error");

    const query = `QUERY`;
    try {
      const result = await testConn["executeQuery"](query);
      throw new Error("Failed");
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });
});
