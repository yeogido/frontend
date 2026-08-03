export const getTravelRecordMapYears = (
  isAuthenticated: boolean,
  cachedYears: number[] | undefined,
) => (isAuthenticated ? cachedYears ?? [] : []);

export const getTravelRecordMapYearQueries = (
  isAuthenticated: boolean,
  years: number[],
) => years.map((year) => ({ year, enabled: isAuthenticated }));

export const getTravelRecordMapRecords = <T>(
  isAuthenticated: boolean,
  recordsByYear: T[][],
) => (isAuthenticated ? recordsByYear.flat() : []);
