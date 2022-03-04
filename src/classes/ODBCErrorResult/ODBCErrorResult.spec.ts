import { ODBCErrorResult } from "./ODBCErrorResult";

const message = "test_message_main";
const errors: ODBCErrorResult["errors"] = [
  {
    code: 5,
    message: "test_message",
    state: "test_state",
  },
];
const query: ODBCErrorResult["query"] = {
  formatted: "test_formatted",
  parameters: ["test1", "test2"],
  raw: "test_raw",
};

describe("ODBCErrorResult", () => {
  it("should create an odbc error result", () => {
    const err = new ODBCErrorResult(message, errors, query);

    expect(err.errors).toEqual(errors);
    expect(err.query).toEqual(query);
    expect(err.message).toEqual(message);
  });

  it("should create an odbc error result with errors", () => {
    const err = new ODBCErrorResult(message, undefined, query);
    expect(err.errors).toEqual([]);
    expect(err.query).toEqual(query);
    expect(err.message).toEqual(message);
  });

  it("should create an odbc error result without query information", () => {
    const err = new ODBCErrorResult(message, errors);
    expect(err.errors).toEqual(errors);
    expect(err.query).toEqual({ raw: "", parameters: [], formatted: "" });
    expect(err.message).toEqual(message);
  });
});
