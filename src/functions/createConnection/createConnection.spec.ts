import { createConnection } from "..";
import { TESTING_DSN } from "../../../private/constants";
import { ODBCConnection } from "../../classes/ODBCConnection/ODBCConnection";

describe("createConnection", () => {
  it("should create a connection", async () => {
    const connection = await createConnection({ DSN: TESTING_DSN });
    expect(connection).toBeInstanceOf(ODBCConnection);
  });
});
