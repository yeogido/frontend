import type { TravelRecordMapParams } from '../../../types/travelRecord.type';

export const TRAVEL_RECORD_MAP_QUERY_KEY = ['travelRecordMap'] as const;

export function getTravelMapQueryKey(
  userId: number | null,
  authGeneration: number,
  params: TravelRecordMapParams
) {
  return [
    ...TRAVEL_RECORD_MAP_QUERY_KEY,
    userId,
    authGeneration,
    params,
  ] as const;
}

export const getTravelRecordMapYears = (
  isAuthenticated: boolean,
  cachedYears: number[] | undefined
) => (isAuthenticated ? (cachedYears ?? []) : []);

export const getTravelRecordMapYearQueries = (
  isAuthenticated: boolean,
  years: number[]
) => years.map((year) => ({ year, enabled: isAuthenticated }));

export const getTravelRecordMapRecords = <T>(
  isAuthenticated: boolean,
  recordsByYear: T[][]
) => (isAuthenticated ? recordsByYear.flat() : []);
