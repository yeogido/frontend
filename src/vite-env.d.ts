/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_KAKAO_MAP_API_KEY?: string;
  readonly VITE_NAVER_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.geojson' {
  import type { FeatureCollection } from 'geojson';

  const value: FeatureCollection;

  export default value;
}

declare namespace kakao.maps {
  export class LatLng {
    constructor(latitude: number, longitude: number);
  }
  export class LatLngBounds {
    constructor();
    extend(latlng: LatLng): void;
  }
  export class Size {
    constructor(width: number, height: number);
  }
  export class Point {
    constructor(x: number, y: number);
  }
  export class MarkerImage {
    constructor(src: string, size: Size, options?: { offset?: Point });
  }
  export class Map {
    constructor(
      container: HTMLElement,
      options: { center: LatLng; level: number }
    );
    setLevel(level: number): void;
    panTo(latlng: LatLng): void;
    setBounds(bounds: LatLngBounds): void;
  }
  export class Marker {
    constructor(options: {
      map: Map;
      position: LatLng;
      title?: string;
      image?: MarkerImage;
    });
    setMap(map: Map | null): void;
  }
  export class CustomOverlay {
    constructor(options: {
      map: Map;
      position: LatLng;
      content: HTMLElement | string;
      yAnchor?: number;
    });
    setMap(map: Map | null): void;
  }
  export class Polyline {
    constructor(options: {
      map: Map;
      path: LatLng[];
      strokeWeight?: number;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeStyle?: string;
    });
    setMap(map: Map | null): void;
  }
  export namespace event {
    function addListener(
      target: Marker,
      type: 'click',
      handler: () => void
    ): void;
  }
  export function load(callback: () => void): void;
}

interface Window {
  kakao?: {
    maps?: typeof kakao.maps;
  };
  Kakao?: KakaoSDK;
  naver?: {
    LoginWithNaverId: new (settings: {
      clientId: string;
      callbackUrl: string;
      isPopup?: boolean;
    }) => NaverLoginWithNaverId;
  };
}

// Kakao.Auth.login()은 최신 JS SDK(v2.x)에 존재하지 않는다 (실제 배포된
// kakao.min.js 번들과 공식 문서 둘 다 확인 — authorize()만 제공됨).
// authorize()는 리다이렉트 방식이라 반환값 없이 페이지를 이동시킨다.
interface KakaoAuth {
  authorize(settings: {
    redirectUri: string;
    scope?: string;
    prompt?: string;
    loginHint?: string;
    state?: string;
    throughTalk?: boolean;
  }): void;
}

interface KakaoSDK {
  init(appKey: string): void;
  isInitialized(): boolean;
  Auth: KakaoAuth;
}

// 네이버 로그인 JS SDK(naveridlogin_js_sdk_2.0.2.js)는 Kakao와 달리
// response_type=token(암묵적 인증)을 실제로 지원해, redirect 후
// accessToken을 URL fragment로 직접 돌려준다. authorize()로 로그인
// 페이지로 이동시키고, 콜백 페이지에서는 같은 설정으로 인스턴스를
// 다시 만들어 init() → getLoginStatus()를 호출해 토큰을 읽는다.
interface NaverLoginWithNaverId {
  init(): void;
  authorize(): void;
  getLoginStatus(callback: (status: boolean) => void): void;
  accessToken: { accessToken: string; ttl: number } | null;
}
