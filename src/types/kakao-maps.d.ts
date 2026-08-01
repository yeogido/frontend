interface Window {
  kakao?: {
    maps: {
      load(callback: () => void): void;
      LatLng: new (latitude: number, longitude: number) => KakaoLatLng;
      Map: new (
        container: HTMLElement,
        options: { center: KakaoLatLng; level: number }
      ) => KakaoMap;
      Marker: new (options: {
        map: KakaoMap;
        position: KakaoLatLng;
      }) => KakaoMarker;
      services: {
        Places: new () => KakaoPlacesService;
        Status: KakaoPlacesStatus;
      };
    };
  };
}

type KakaoLatLng = object;
type KakaoMap = object;
type KakaoMarker = object;

interface KakaoPlacesStatus {
  OK: 'OK';
  ZERO_RESULT: 'ZERO_RESULT';
  ERROR: 'ERROR';
}

interface KakaoPlacesService {
  keywordSearch(
    keyword: string,
    callback: (
      data: KakaoPlacesSearchResult[],
      status: KakaoPlacesStatus[keyof KakaoPlacesStatus],
      pagination: unknown
    ) => void,
    options?: Record<string, unknown>
  ): void;
}

interface KakaoPlacesSearchResult {
  id: string;
  place_name: string;
  category_name: string;
  category_group_code: string;
  phone: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
  place_url: string;
}
