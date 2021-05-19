import { createConnectionStringFromConfig } from "./createConnectionStringFromConfig";

describe("createConnectionStringFromConfig", () => {
  it("should create a connection string for a DSN", () => {
    const result = createConnectionStringFromConfig({ DSN: "TEST" });
    expect(result).toEqual(`DSN=TEST`);
  });

  it("should create a connection string for a raw connection string", () => {
    const result = createConnectionStringFromConfig({ connectionString: "CONNECTION STRING" });
    expect(result).toEqual("CONNECTION STRING");
  });

  it("should create a connection string for a config object", () => {
    const type = "actianzen";
    const result = createConnectionStringFromConfig({
      type: type,
      driver: "DRIVER",
      server: "SERVER",
      database: "DATABASE",
    });
    expect(result).toEqual(`Driver={DRIVER};ServerName=SERVER;DBQ=DATABASE`);

    const result2 = createConnectionStringFromConfig({
      type: type,
      driver: "DRIVER",
      server: "SERVER",
      database: "DATABASE",
      auth: {
        user: "USER",
        password: "PASSWORD",
      },
    });
    expect(result2).toEqual(`Driver={DRIVER};ServerName=SERVER;DBQ=DATABASE;UID=USER;PWD=PASSWORD`);
  });
});
