import { customInsertParams } from "./customInsertParams";

describe("customInsertParams", () => {
  it("should insert the params correctly", () => {
    const query = `SELECT * FROM TEST WHERE "test" = ? AND "test" = ?`;
    const params = [1, "val"];

    const result = customInsertParams(query, params);
    expect(result).toEqual(`SELECT * FROM TEST WHERE "test" = 1 AND "test" = 'val'`);
  });

  it("should return query if no params", () => {
    const query = `QUERY`;
    const result = customInsertParams(query);

    expect(result).toEqual(`QUERY`);
  });

  it("should throw error if too many params are given", () => {
    const query = `SELECT * FROM TEST WHERE "test" = ?`;
    const params = ["val1", "unexpected", "unexpected"];

    try {
      const result = customInsertParams(query, params);
      throw new Error("Failed");
    } catch (error) {
      expect(error.message).toContain("Expected 1 parameters but got 3");
    }
  });

  it("should throw error if too many params are given", () => {
    const query = `SELECT * FROM TEST WHERE "test" = ? AND "test" = ?`;
    const params = ["val1"];

    try {
      const result = customInsertParams(query, params);
      throw new Error("Failed");
    } catch (error) {
      expect(error.message).toContain("Expected 2 parameters but got 1");
    }
  });

  it("should escape single quotes to double single quotes", () => {
    const query = `SELECT * FROM TEST WHERE "test" = ?`;
    const params = ["val'"];

    const result = customInsertParams(query, params);
    expect(result).toEqual(`SELECT * FROM TEST WHERE "test" = 'val'''`);
  });
});
