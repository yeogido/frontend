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
