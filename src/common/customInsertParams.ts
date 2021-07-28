import { QueryParameter } from "../types";

export function customInsertParams(
  sql: string,
  parameters?: QueryParameter[]
): string {
  if (!parameters || !parameters.length) return sql; // If no parameters, just return the sql provided

  // Check that the number of provided params equals the number of expected params
  const countProvidedParams = parameters.length; // The amount of parameters given
  const countExpectedParams = (sql.match(/\?/g) || []).length; // Count all '?' in the sql string
  if (countExpectedParams !== countProvidedParams)
    throw new Error(
      `Expected ${countExpectedParams} parameters but got ${countProvidedParams}`
    );

  // Loop through the parameters and excape all single quotes
  const escapedParams = parameters.map((param) => {
    if (typeof param !== "string") return param; // If not string just return the param
    return param.replace(/'/g, "''"); // Return the string with single quotes escaped
  });

  // Replace all '?' in the sql statement with the provided params
  // Add single quotes around the param if it's a string
  const newSql = sql.replace(/\?/g, () => {
    let replacement = escapedParams[0]; // Set the replacement to the first param
    escapedParams.shift(); // Remove the param from the array
    if (typeof replacement === "string") replacement = `'${replacement}'`;
    return String(replacement);
  });

  return newSql;
}
