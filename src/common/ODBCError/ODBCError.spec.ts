import odbc from "odbc";
import { ODBCError } from "./ODBCError";

describe("ODBCError", () => {
  it("should create an error with no parameters", async () => {
    const e = new ODBCError();
    expect(e).toBeInstanceOf(ODBCError);
  });

  it("should create an error with an already created ODBCError", () => {
    const existing = new ODBCError();

    existing.name = "name";
    existing.message = "message";
    existing.stack = "stack";

    const e = new ODBCError(existing);
    expect(e.name).toEqual(existing.name);
    expect(e.message).toEqual(existing.message);
    expect(e.stack).toEqual(existing.stack);
    expect(e.query).toEqual(existing.query);
    expect(e.errors).toEqual(existing.errors);
  });

  it("should create an error from an odbc package error", () => {
    const odbcError: odbc.NodeOdbcError = {
      message: "message",
      name: "name",
      odbcErrors: [{ code: 1, message: "message", state: "state" }],
      stack: "stack",
    };

    const e = new ODBCError(odbcError);
    expect(e.name).toEqual(odbcError.name);
    expect(e.message).toEqual(odbcError.message);
    expect(e.stack).toEqual(odbcError.stack);
    expect(e.errors).toEqual(odbcError.odbcErrors);
  });

  it("should create an error from a standard error", () => {
    const std = new Error("stdmessage");
    std.name = "stdname";
    std.stack = "stdstack";
    const e = new ODBCError(std);
    expect(e.name).toEqual(std.name);
    expect(e.message).toEqual(std.message);
    expect(e.stack).toEqual(std.stack);
  });

  it("should create an error from a string", () => {
    const message = "stringmessage";
    const e = new ODBCError(message);
    expect(e.message).toEqual(message);
  });
});
