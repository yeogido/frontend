import { isValidGeoPoint, type GeoPoint } from '../types';

// 카카오맵 공식 길찾기 웹 링크 포맷: 모바일에서는 앱으로 딥링크되고,
// 데스크톱에서는 웹 지도로 열린다. 출발지는 카카오맵이 접속 기기의
// 현재 위치를 자동으로 사용한다.
export function getKakaoMapRouteUrl(
  name: string,
  destination: GeoPoint
): string {
  return `https://map.kakao.com/link/to/${encodeURIComponent(name)},${destination.latitude},${destination.longitude}`;
}

// 좌표가 없으면 조용히 무시한다 (호출부에서 별도 분기 없이 쓰기 위함).
export function openKakaoMapRoute(
  name: string,
  destination?: GeoPoint | null
): void {
  if (!isValidGeoPoint(destination)) return;
  window.open(
    getKakaoMapRouteUrl(name, destination),
    '_blank',
    'noopener,noreferrer'
  );
}

// 카카오맵 공식 장소 검색 웹 링크 포맷. 좌표 없이 장소명(+ 주소)만으로
// 위치를 찾아 보여준다. 좋아요 목록처럼 좌표를 내려주지 않는 응답에 사용한다.
export function getKakaoMapSearchUrl(query: string): string {
  return `https://map.kakao.com/link/search/${encodeURIComponent(query)}`;
}

export function openKakaoMapSearch(query: string): void {
  if (!query.trim()) return;
  window.open(getKakaoMapSearchUrl(query), '_blank', 'noopener,noreferrer');
}

// 카카오 장소 id(externalPlaceId)로 여는 카카오맵 장소 상세 페이지.
// 검색보다 정확하게 그 장소로 바로 연결된다.
export function getKakaoMapPlaceUrl(placeId: string): string {
  return `https://place.map.kakao.com/${encodeURIComponent(placeId)}`;
}

export function openKakaoMapPlace(placeId: string): void {
  if (!placeId.trim()) return;
  window.open(getKakaoMapPlaceUrl(placeId), '_blank', 'noopener,noreferrer');
}
