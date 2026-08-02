import type { RegionRecordPhoto } from '../../home/map/types/regionPhoto';
import type { TravelRecordFolder } from '../types';

export const getTravelRecordRegionPhotoRecords = (
  folders: readonly TravelRecordFolder[],
): RegionRecordPhoto[] => {
  const latestFoldersByRegion = new Map<string, TravelRecordFolder>();

  folders.forEach((folder) => {
    if (!folder.regionCode || !folder.photos[0]) {
      return;
    }

    const currentFolder = latestFoldersByRegion.get(folder.regionCode);

    if (
      !currentFolder ||
      folder.startDate.localeCompare(currentFolder.startDate) > 0
    ) {
      latestFoldersByRegion.set(folder.regionCode, folder);
    }
  });

  return Array.from(latestFoldersByRegion.values()).map((folder) => ({
    regionName: folder.regionName,
    photoUrl: folder.photos[0],
    folderId: folder.id,
  }));
};
