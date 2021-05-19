import { trimEndOfResults } from "./trimEndOfResults";

describe("trimEndOfResults", () => {
  it("should trim whitespaces correctly", () => {
    const input = {
      test1: "5",
      test2: "  5  ",
      test3: "5  ",
      test4: "  5",
      test5: 5,
      test6: true,
    };
    const expectation = {
      test1: "5",
      test2: "  5",
      test3: "5",
      test4: "  5",
      test5: 5,
      test6: true,
    };

    const result = trimEndOfResults([input, input]);
    expect(result).toEqual([expectation, expectation]);
  });
});
