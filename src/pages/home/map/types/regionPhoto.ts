/**
 * 여행 기록 페이지에서 사용자가 올린 사진 중, 지도에 채워 넣을 대표 사진.
 */
export interface RegionRecordPhoto {
  /** korea-province.json / korea-city.json의 properties.name과 동일한 지역명 */
  regionName: string;
  /** 지도에 채워질 대표 사진 URL */
  photoUrl: string;
  /** 클릭 시 이동할 여행 기록 폴더 id (/travel-record/:folderId) */
  folderId: string;
}

/** 컴포넌트 내부에서 다루기 편하도록 지역명 기준으로 변환한 맵 */
export type RegionPhotoMap = Record<
  string,
  { photoUrl: string; folderId: string }
>;

export function toRegionPhotoMap(
  photos: RegionRecordPhoto[],
): RegionPhotoMap {
  const map: RegionPhotoMap = {};

  for (const photo of photos) {
    map[photo.regionName] = {
      photoUrl: photo.photoUrl,
      folderId: photo.folderId,
    };
  }

  return map;
}