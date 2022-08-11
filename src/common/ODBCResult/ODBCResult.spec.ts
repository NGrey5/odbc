import { ODBCResult } from "./ODBCResult";

type MockResultType = {
  value1: string;
  value2: number;
  value3: boolean;
};

const RESULT_ARRAY: MockResultType[] = [
  { value1: "string   ", value2: 1, value3: true },
];

const RESULT: any = RESULT_ARRAY as any;
RESULT["count"] = 1;
RESULT["columns"] = [
  {
    name: "value1",
    dataType: 1,
    columnSize: 10,
    decimalDigits: 0,
    nullable: false,
  },
];
RESULT["statement"] = "selectme";
RESULT["parameters"] = [];
RESULT["return"] = undefined;

describe("ODBCResult", () => {
  it("should create a result from the odbc package results", () => {
    const result = new ODBCResult(RESULT);
    expect(JSON.stringify(result.rows)).toEqual(JSON.stringify(RESULT_ARRAY));
    expect(result.count).toEqual(RESULT["count"]);
    expect(result.fields).toEqual(RESULT["columns"]);
    expect(result.statement).toEqual(RESULT["statement"]);
    expect(result.parameters).toEqual(RESULT["parameters"]);
    expect(result.return).toEqual(RESULT["return"]);
  });
});
