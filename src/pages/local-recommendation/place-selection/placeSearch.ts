import { loadKakaoMapsSdk } from '../../../components/kakaomap/utils/kakaoMap.ts';
import type { PlaceItem } from './types';

export const normalizePlaceQuery = (query: string) =>
  query.replace(/\s+/g, '').toLocaleLowerCase('ko-KR');

export const mapKakaoPlaceToItem = (
  result: KakaoPlacesSearchResult
): PlaceItem => {
  const roadAddress = result.road_address_name ?? '';
  const lotAddress = result.address_name ?? '';

  return {
    id: result.id,
    title: result.place_name,
    address: roadAddress || lotAddress,
    imageSrc: null,
    externalPlaceId: result.id,
    categoryGroupCode: result.category_group_code,
    roadAddress,
    lotAddress,
    latitude: Number(result.y),
    longitude: Number(result.x),
  };
};

export const searchPlaces = async (query: string): Promise<PlaceItem[]> => {
  const normalizedQuery = normalizePlaceQuery(query);

  if (!normalizedQuery) {
    return [];
  }

  await loadKakaoMapsSdk(import.meta.env.VITE_KAKAO_MAP_API_KEY ?? '');

  if (!window.kakao?.maps.services) {
    throw new Error('카카오맵 장소 검색 서비스를 불러오지 못했습니다.');
  }

  const places = new window.kakao.maps.services.Places();
  const { Status } = window.kakao.maps.services;

  return new Promise((resolve, reject) => {
    places.keywordSearch(query, (data, status) => {
      if (status === Status.OK) {
        resolve(data.map(mapKakaoPlaceToItem));
        return;
      }

      if (status === Status.ZERO_RESULT) {
        resolve([]);
        return;
      }

      reject(new Error('장소 검색에 실패했습니다.'));
    });
  });
};
