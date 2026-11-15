import { toMapShapeRegion } from '../../home/map/utils/regionCodeLookup.ts';

import type { RegionRecordPhoto } from '../../home/map/types/regionPhoto';
import type { TravelMapViewer, TravelRecordFolder } from '../types';

interface LatestRegionFolder {
  folder: TravelRecordFolder;
  shapeName: string;
}

// 수신자용 지도에는 비공개 원본 URL을 넘기지 않는다. 서버가 가공한
// 공유 전용 썸네일을 제공하기 전까지는 방문 사실만 나타내는 이미지를 쓴다.
const restrictedPhotoPlaceholder = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><defs><filter id="blur"><feGaussianBlur stdDeviation="4"/></filter></defs><rect width="100" height="100" fill="#adb6bd"/><g filter="url(#blur)"><ellipse cx="20" cy="20" rx="45" ry="35" fill="#d3d9dc"/><ellipse cx="80" cy="75" rx="50" ry="40" fill="#718596"/><ellipse cx="15" cy="95" rx="40" ry="30" fill="#b4a598"/></g></svg>'
)}`;

export const getTravelRecordRegionPhotoRecords = (
  folders: readonly TravelRecordFolder[],
  viewer: TravelMapViewer = 'owner'
): RegionRecordPhoto[] => {
  const latestFoldersByRegion = new Map<string, LatestRegionFolder>();

  folders.forEach((folder) => {
    const isRestricted = viewer === 'shared' && folder.visibility !== 'public';
    if (!folder.regionCode || (!folder.photos[0] && !isRestricted)) {
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
      photoUrl:
        viewer === 'shared' && folder.visibility !== 'public'
          ? folder.sharedThumbnailUrl || restrictedPhotoPlaceholder
          : folder.photos[0],
      folderId:
        viewer === 'shared' && folder.visibility !== 'public' ? '' : folder.id,
      ...(viewer === 'shared' && folder.visibility !== 'public'
        ? { isBlurred: true }
        : {}),
    })
  );
};
