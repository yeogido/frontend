import type {
  TravelRecordApiVisibility,
  TravelRecordMapItem,
} from '../../../types/travelRecord.type';
import type { RegionDetailResponse } from '../../../types/region.type';
import type { TravelRecordFolder, TravelRecordVisibility } from '../types';
import { findMapRegion } from '../../home/map/utils/regionCodeLookup.ts';

const visibilityByApiValue = {
  PRIVATE: 'private',
  FRIENDS: 'friends',
  PUBLIC: 'public',
} satisfies Record<TravelRecordApiVisibility, TravelRecordVisibility>;

type MapRegionInfo = Pick<RegionDetailResponse, 'name' | 'fullName'>;

const hasCoordinates = (record: TravelRecordMapItem) =>
  typeof record.latitude === 'number' &&
  Number.isFinite(record.latitude) &&
  typeof record.longitude === 'number' &&
  Number.isFinite(record.longitude);

const resolveRegion = (
  record: TravelRecordMapItem,
  regionInfo?: MapRegionInfo
) =>
  findMapRegion({
    name: regionInfo?.name ?? record.regionName,
    fullName: regionInfo?.fullName ?? record.regionName,
  });

export function mapTravelMapRecordToFolder(
  record: TravelRecordMapItem,
  regionInfo?: MapRegionInfo
): TravelRecordFolder {
  const region = hasCoordinates(record)
    ? resolveRegion(record, regionInfo)
    : null;
  const photos = [...record.images]
    .sort((a, b) => a.imageOrder - b.imageOrder)
    .map((image) => image.imageUrl)
    .filter(Boolean);

  return {
    id: String(record.travelRecordId),
    regionId: record.regionId,
    regionName: record.regionName,
    regionCode: region?.code ?? '',
    title: record.title,
    startDate: record.startDate,
    endDate: record.endDate,
    period: `${record.startDate.slice(5).replace('-', '.')} - ${record.endDate.slice(5).replace('-', '.')}`,
    visibility: visibilityByApiValue[record.visibility],
    photos: photos.length ? (photos as [string, ...string[]]) : [''],
    decorations: [],
  };
}

export function getUnresolvedTravelMapRegionIds(
  records: TravelRecordMapItem[]
): number[] {
  // 동명이 지역이나 축약형 지역명만 상세 이름을 보충한다. 지도 사진을 위해
  // 앨범 상세를 요청하지 않으며 좌표 없는 기록은 마커를 만들지 않는다.
  return [
    ...new Set(
      records
        .filter((record) => hasCoordinates(record) && !resolveRegion(record))
        .map((record) => record.regionId)
    ),
  ];
}
