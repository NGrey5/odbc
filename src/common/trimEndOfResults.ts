export function trimEndOfResults<T = Record<string, any>>(dbResult: T[]): T[] {
  const trimmed = [...dbResult];
  trimmed.forEach((row: any) => {
    Object.keys(row).map((key) => {
      if (typeof row[key] === "string")
        row[key] = (row[key] as string).trimEnd();
    });
  });
  return trimmed;
}
