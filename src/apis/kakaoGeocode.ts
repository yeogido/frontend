import type { GeoPoint } from '../components/kakaomap/types';

// dapi.kakao.com/v2/local/search/address.json 응답 형태 — x=경도, y=위도(둘 다 문자열).
interface KakaoAddressSearchResponse {
  readonly documents?: readonly {
    readonly x?: string;
    readonly y?: string;
  }[];
}

/**
 * 위경도가 없는 장소(예: 콘텐츠/행사)의 주소 문자열을 카카오 주소 검색으로
 * 좌표로 변환한다. 검색 결과가 없으면 null.
 */
export async function fetchKakaoAddressGeocode(
  address: string,
  signal?: AbortSignal
): Promise<GeoPoint | null> {
  const query = address.trim();
  if (!query) return null;

  const params = new URLSearchParams({ query });
  const response = await fetch(`/kakao-local/search/address.json?${params}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error('Failed to geocode address via Kakao.');
  }

  const data = (await response.json()) as KakaoAddressSearchResponse;
  const document = data.documents?.[0];
  const longitude = document?.x ? Number(document.x) : undefined;
  const latitude = document?.y ? Number(document.y) : undefined;

  return longitude !== undefined &&
    latitude !== undefined &&
    !Number.isNaN(longitude) &&
    !Number.isNaN(latitude)
    ? { latitude, longitude }
    : null;
}
