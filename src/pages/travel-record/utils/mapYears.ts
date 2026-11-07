import type { TravelRecordFolder } from '../types';

export function getTravelMapYears(
  years: readonly number[],
  currentYear: number
): number[] {
  const pastYears = years.filter(
    (year) => Number.isInteger(year) && year > 0 && year <= currentYear
  );
  const earliestYear = Math.min(currentYear, ...pastYears);
  return Array.from(
    { length: currentYear - earliestYear + 1 },
    (_, index) => currentYear - index
  );
}

export function filterTravelMapFoldersByYear(
  folders: readonly TravelRecordFolder[],
  year: number | null
) {
  return year === null
    ? folders
    : folders.filter((folder) => Number(folder.startDate.slice(0, 4)) === year);
}
