export interface MapCoordinates {
  readonly latitude: number;
  readonly longitude: number;
}

export const SEOUL_CITY_HALL: MapCoordinates = Object.freeze({
  latitude: 37.5665,
  longitude: 126.978,
});

const KAKAO_MAP_SCRIPT_ID = 'kakao-maps-sdk';
let sdkPromise: Promise<void> | null = null;

export function getCurrentMapCoordinates(
  geolocation: Geolocation | undefined = typeof navigator === 'undefined'
    ? undefined
    : navigator.geolocation
): Promise<MapCoordinates> {
  if (!geolocation) {
    return Promise.resolve({ ...SEOUL_CITY_HALL });
  }

  return new Promise((resolve) => {
    geolocation.getCurrentPosition(
      ({ coords }) => {
        resolve({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      },
      () => resolve({ ...SEOUL_CITY_HALL }),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 60000,
      }
    );
  });
}

export function loadKakaoMapsSdk(appKey: string): Promise<void> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(
      new Error('브라우저에서만 카카오맵을 불러올 수 있습니다.')
    );
  }

  if (window.kakao?.maps) {
    const kakaoMaps = window.kakao.maps;
    return new Promise((resolve) => kakaoMaps.load(resolve));
  }

  if (!appKey.trim()) {
    return Promise.reject(new Error('카카오맵 API 키가 설정되지 않았습니다.'));
  }

  if (sdkPromise) {
    return sdkPromise;
  }

  sdkPromise = new Promise((resolve, reject) => {
    const handleLoad = () => {
      if (!window.kakao?.maps) {
        sdkPromise = null;
        reject(new Error('카카오맵 SDK를 초기화하지 못했습니다.'));
        return;
      }
      window.kakao.maps.load(resolve);
    };

    const handleError = () => {
      sdkPromise = null;
      reject(new Error('카카오맵 SDK를 불러오지 못했습니다.'));
    };

    const existingScript = document.getElementById(
      KAKAO_MAP_SCRIPT_ID
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener('load', handleLoad, { once: true });
      existingScript.addEventListener('error', handleError, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = KAKAO_MAP_SCRIPT_ID;
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(appKey)}&autoload=false&libraries=services`;
    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });
    document.head.appendChild(script);
  });

  return sdkPromise;
}
