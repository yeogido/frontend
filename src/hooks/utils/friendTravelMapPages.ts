import { geoContains } from 'd3-geo';

import { koreaProvince } from '../../pages/home/map/assets/koreaProvince.ts';
import type { RegionRecordPhoto } from '../../pages/home/map/types/regionPhoto';
import {
  findMapRegion,
  toMapShapeRegion,
  type MapRegionMatch,
} from '../../pages/home/map/utils/regionCodeLookup.ts';
import type { FriendTravelMapItem } from '../../types/friend.type';

// 훅 파일은 react-query를 import해서 Node 테스트 러너가 읽지 못한다.
// 친구 여행 지도의 병합, 정규화, 지도 사진 변환만 따로 두어 그대로 검증한다.

/** null 필드를 안전한 값으로 바꾼 지도 기록. 블러 여부는 서버의 blurred만 따른다. */
export interface FriendTravelMapRecord {
  blurred: boolean;
  travelRecordId: number;
  regionId: number;
  regionName: string;
  latitude: number | null;
  longitude: number | null;
  startDate: string;
  endDate: string;
  title: string;
  /** imageOrder 순. 블러 항목이나 사진이 없는 기록은 빈 배열. */
  photos: string[];
}

const toFiniteNumber = (value: number | null | undefined) =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

/** 서버 항목의 null 필드를 안전하게 정리한다. 블러 항목의 사진은 쓰지 않는다. */
export function normalizeFriendTravelMapItem(
  item: FriendTravelMapItem
): FriendTravelMapRecord {
  const blurred = item.blurred === true;
  const photos = blurred
    ? []
    : [...(item.images ?? [])]
        .sort((a, b) => a.imageOrder - b.imageOrder)
        .map((image) => image.imageUrl)
        .filter(Boolean);

  return {
    blurred,
    travelRecordId: item.travelRecordId,
    regionId: item.regionId,
    regionName: item.regionName ?? '',
    latitude: toFiniteNumber(item.latitude),
    longitude: toFiniteNumber(item.longitude),
    startDate: item.startDate,
    endDate: item.endDate,
    title: blurred ? '' : (item.title ?? ''),
    photos,
  };
}

/**
 * 연도별로 받은 목록을 하나로 합친다. 여러 해에 걸친 기록은 두 연도 요청에 모두
 * 나올 수 있어 travelRecordId가 같으면 앞에 나온 것만 남긴다.
 */
export function mergeFriendTravelMapItems(
  lists: readonly (readonly FriendTravelMapItem[] | undefined)[]
): FriendTravelMapItem[] {
  const seen = new Set<number>();
  const items: FriendTravelMapItem[] = [];

  for (const list of lists) {
    for (const item of list ?? []) {
      if (!seen.has(item.travelRecordId)) {
        seen.add(item.travelRecordId);
        items.push(item);
      }
    }
  }

  return items;
}

/** 연도 드롭다운 항목. 유효한 정수 연도만 중복 없이 내림차순으로 둔다. */
export function getFriendMapYearOptions(
  years: readonly number[] | undefined
): number[] {
  return [
    ...new Set(
      (years ?? []).filter((year) => Number.isInteger(year) && year > 0)
    ),
  ].sort((a, b) => b - a);
}

const provinceFeatures = (koreaProvince as GeoJSON.FeatureCollection).features;

/** 좌표가 들어 있는 도·광역시 도형. 지역 이름으로 못 찾았을 때의 마지막 수단이다. */
export function findProvinceByCoordinates(
  latitude: number | null,
  longitude: number | null
): MapRegionMatch | null {
  if (latitude === null || longitude === null) {
    return null;
  }

  for (const feature of provinceFeatures) {
    const properties = feature.properties as {
      name?: string;
      code?: string;
    } | null;

    if (
      properties?.name &&
      properties.code &&
      geoContains(feature, [longitude, latitude])
    ) {
      return { name: properties.name, code: properties.code };
    }
  }

  return null;
}

interface RegionInfo {
  name?: string;
  fullName?: string;
}

/**
 * 기록이 칠할 지도 도형을 고른다. 이름(지역 상세가 있으면 그 이름) → 좌표 순이고,
 * 둘 다 안 맞으면 null이라 그 기록은 지도에 칠하지 않는다.
 */
export function resolveFriendMapRegion(
  record: Pick<FriendTravelMapRecord, 'regionName' | 'latitude' | 'longitude'>,
  regionInfo?: RegionInfo
): MapRegionMatch | null {
  return (
    findMapRegion({
      name: regionInfo?.name ?? record.regionName,
      fullName: regionInfo?.fullName ?? record.regionName,
    }) ?? findProvinceByCoordinates(record.latitude, record.longitude)
  );
}

/** 이름만으로 도형을 못 찾아 지역 상세(fullName)를 보충해야 하는 regionId. */
export function getUnresolvedFriendMapRegionIds(
  records: readonly Pick<FriendTravelMapRecord, 'regionId' | 'regionName'>[]
): number[] {
  return [
    ...new Set(
      records
        .filter(
          (record) =>
            Number.isInteger(record.regionId) &&
            !findMapRegion({
              name: record.regionName,
              fullName: record.regionName,
            })
        )
        .map((record) => record.regionId)
    ),
  ];
}

// 블러 항목에 쓰는 대체 이미지. 사진이 없어 방문 사실만 나타내는 흐린 배경이다.
const BLURRED_PHOTO_PLACEHOLDER = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><defs><filter id="b"><feGaussianBlur stdDeviation="4"/></filter></defs><rect width="100" height="100" fill="#adb6bd"/><g filter="url(#b)"><ellipse cx="25" cy="25" rx="45" ry="35" fill="#d3d9dc"/><ellipse cx="78" cy="72" rx="50" ry="40" fill="#718596"/><ellipse cx="18" cy="92" rx="40" ry="30" fill="#b4a598"/></g></svg>'
)}`;

/**
 * 지도에 칠할 지역별 대표 사진. 광역시 산하 구는 부모 광역시로 합치고, 같은
 * 지역에 여러 기록이 있으면 가장 최근 기록을 쓴다. 블러 여부는 서버의 blurred만
 * 따르고(공개범위로 추정하지 않는다) 블러 항목은 이동할 폴더가 없다.
 */
export function toFriendRegionPhotoRecords(
  records: readonly FriendTravelMapRecord[],
  getRegionInfo?: (regionId: number) => RegionInfo | undefined
): RegionRecordPhoto[] {
  const latestByShape = new Map<
    string,
    { record: FriendTravelMapRecord; shapeName: string }
  >();

  for (const record of records) {
    // 사진이 없는 공개 기록은 칠할 이미지가 없어 건너뛴다.
    if (!record.blurred && record.photos.length === 0) {
      continue;
    }

    const region = resolveFriendMapRegion(
      record,
      getRegionInfo?.(record.regionId)
    );

    if (!region) {
      continue;
    }

    const shape = toMapShapeRegion(region);
    const current = latestByShape.get(shape.code);

    if (
      !current ||
      record.startDate.localeCompare(current.record.startDate) > 0
    ) {
      latestByShape.set(shape.code, { record, shapeName: shape.name });
    }
  }

  return Array.from(latestByShape.values()).map(({ record, shapeName }) =>
    record.blurred
      ? {
          regionName: shapeName,
          photoUrl: BLURRED_PHOTO_PLACEHOLDER,
          folderId: '',
          isBlurred: true,
        }
      : {
          regionName: shapeName,
          photoUrl: record.photos[0],
          folderId: String(record.travelRecordId),
        }
  );
}
