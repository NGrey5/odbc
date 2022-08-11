import { ODBCConnection } from "../common/ODBCConnection/ODBCConnection";
import { ODBCConnectionModifier } from "../common/ODBCConnectionModifier/ODBCConnectionModifier";
import { TEST_CONNECTION_STRING } from "../test";
import { trimODBCResultsPipe } from "./trimODBCResultsPipe";

describe("trimODBCResultsPipe", () => {
  it("should trim the results", async () => {
    const value = "string     ";
    const query = `SELECT '${value}' as "value"`;
    const conn = await ODBCConnection.create(TEST_CONNECTION_STRING);

    let result = await conn.query(query);
    expect(result.rows[0]).toEqual({ value: value });

    conn.useConnectionModifier(
      new ODBCConnectionModifier({
        resultPipes: [trimODBCResultsPipe],
      })
    );

    result = await conn.query(query);
    expect(result.rows[0]).toEqual({ value: value.trimEnd() });
  });
});
