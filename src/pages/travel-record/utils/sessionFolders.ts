import type { TravelRecordFolder } from '../types';

export const applyTravelRecordSessionChanges = (
  folders: TravelRecordFolder[],
  editedFolders: Record<string, TravelRecordFolder>,
  deletedFolderIds: ReadonlySet<string>,
) =>
  folders
    .filter((folder) => !deletedFolderIds.has(folder.id))
    .map((folder) => editedFolders[folder.id] ?? folder);
