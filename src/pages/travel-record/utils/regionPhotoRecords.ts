import { toMapShapeRegion } from '../../home/map/utils/regionCodeLookup.ts';

import type { RegionRecordPhoto } from '../../home/map/types/regionPhoto';
import type { TravelRecordFolder } from '../types';

interface LatestRegionFolder {
  folder: TravelRecordFolder;
  shapeName: string;
}

export const getTravelRecordRegionPhotoRecords = (
  folders: readonly TravelRecordFolder[],
): RegionRecordPhoto[] => {
  const latestFoldersByRegion = new Map<string, LatestRegionFolder>();

  folders.forEach((folder) => {
    if (!folder.regionCode || !folder.photos[0]) {
      return;
    }

    // 광역시 산하 구는 부모 광역시 도형으로 합친다. 같은 광역시의 여러
    // 구 기록이 하나로 묶이므로 그중 가장 최근 기록의 사진이 남는다.
    const shape = toMapShapeRegion({
      name: folder.regionName,
      code: folder.regionCode,
    });
    const current = latestFoldersByRegion.get(shape.code);

    if (
      !current ||
      folder.startDate.localeCompare(current.folder.startDate) > 0
    ) {
      latestFoldersByRegion.set(shape.code, {
        folder,
        shapeName: shape.name,
      });
    }
  });

  return Array.from(latestFoldersByRegion.values()).map(
    ({ folder, shapeName }) => ({
      regionName: shapeName,
      photoUrl: folder.photos[0],
      folderId: folder.id,
    }),
  );
};
