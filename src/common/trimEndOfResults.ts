export function trimEndOfResults(dbResult: Record<string, any>[]): Record<string, any>[] {
  const trimmed = [...dbResult];
  trimmed.forEach((row: any) => {
    Object.keys(row).map((key) => {
      if (typeof row[key] === "string") row[key] = (row[key] as string).trimEnd();
    });
  });
  return trimmed;
}
