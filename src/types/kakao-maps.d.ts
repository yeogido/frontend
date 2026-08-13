interface KakaoPlacesStatus {
  OK: 'OK';
  ZERO_RESULT: 'ZERO_RESULT';
  ERROR: 'ERROR';
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

declare namespace kakao.maps.services {
  class Places {
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

  const Status: KakaoPlacesStatus;
}
