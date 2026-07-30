import type { TravelRecordFolder } from '../types';

export const applyTravelRecordSessionChanges = (
  folders: TravelRecordFolder[],
  editedFolders: Record<string, TravelRecordFolder>,
  deletedFolderIds: ReadonlySet<string>,
) =>
  folders
    .filter((folder) => !deletedFolderIds.has(folder.id))
    .map((folder) => editedFolders[folder.id] ?? folder);

export const getTravelRecordYears = (folders: TravelRecordFolder[]) =>
  Array.from(new Set(folders.map((folder) => folder.year))).sort(
    (currentYear, nextYear) => nextYear - currentYear,
  );

export const getValidTravelRecordYear = (
  years: number[],
  selectedYear: number,
  fallbackYear: number,
) => (years.includes(selectedYear) ? selectedYear : (years[0] ?? fallbackYear));

export const formatTravelRecordLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};
