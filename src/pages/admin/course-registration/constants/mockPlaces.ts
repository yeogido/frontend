import type { PlaceItem } from '../../../local-recommendation/place-selection/types';

// UI만 구현하는 화면이라 실제 카카오맵 검색 대신 정적 목록을 쓴다.
// (카카오맵 검색은 일부 환경에서 재현되지 않는 이슈가 있어 이 화면에는
// 애초에 끌어오지 않는다.) 필드는 실제 PlaceItem과 동일한 셰이프를 쓰므로
// 이후 실제 검색 API로 교체할 때 화면 쪽 코드는 그대로 둬도 된다.
export const mockCoursePlaces: PlaceItem[] = [
  {
    id: 'place-1',
    title: '광안리해수욕장',
    address: '부산 수영구 광안해변로 219',
    imageSrc: null,
    externalPlaceId: 'mock-place-1',
    categoryGroupCode: 'AT4',
    roadAddress: '부산 수영구 광안해변로 219',
    lotAddress: '부산 수영구 광안리 192-20',
    latitude: 35.1531,
    longitude: 129.1186,
  },
  {
    id: 'place-2',
    title: '해운대 블루라인파크',
    address: '부산 해운대구 달맞이길62번길 13',
    imageSrc: null,
    externalPlaceId: 'mock-place-2',
    categoryGroupCode: 'AT4',
    roadAddress: '부산 해운대구 달맞이길62번길 13',
    lotAddress: '부산 해운대구 중동 620-1',
    latitude: 35.1587,
    longitude: 129.1729,
  },
  {
    id: 'place-3',
    title: '감천문화마을',
    address: '부산 사하구 감내2로 203',
    imageSrc: null,
    externalPlaceId: 'mock-place-3',
    categoryGroupCode: 'AT4',
    roadAddress: '부산 사하구 감내2로 203',
    lotAddress: '부산 사하구 감천동 400',
    latitude: 35.0975,
    longitude: 129.0107,
  },
  {
    id: 'place-4',
    title: '태종대유원지',
    address: '부산 영도구 전망로 24',
    imageSrc: null,
    externalPlaceId: 'mock-place-4',
    categoryGroupCode: 'AT4',
    roadAddress: '부산 영도구 전망로 24',
    lotAddress: '부산 영도구 동삼동 산29-1',
    latitude: 35.0523,
    longitude: 129.0868,
  },
  {
    id: 'place-5',
    title: '자갈치시장',
    address: '부산 중구 자갈치해안로 52',
    imageSrc: null,
    externalPlaceId: 'mock-place-5',
    categoryGroupCode: 'MT1',
    roadAddress: '부산 중구 자갈치해안로 52',
    lotAddress: '부산 중구 남포동4가 37-1',
    latitude: 35.0968,
    longitude: 129.0306,
  },
];

export function searchMockCoursePlaces(keyword: string): PlaceItem[] {
  const trimmed = keyword.trim();

  if (!trimmed) {
    return mockCoursePlaces;
  }

  return mockCoursePlaces.filter(
    (place) =>
      place.title.includes(trimmed) || place.address.includes(trimmed)
  );
}
