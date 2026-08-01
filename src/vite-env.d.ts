/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_KAKAO_MAP_API_KEY?: string;
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
  export class Map {
    constructor(container: HTMLElement, options: { center: LatLng; level: number });
    setLevel(level: number): void;
    panTo(latlng: LatLng): void;
    setBounds(bounds: LatLngBounds): void;
  }
  export class Marker {
    constructor(options: { map: Map; position: LatLng; title?: string });
    setMap(map: Map | null): void;
  }
  export class CustomOverlay {
    constructor(options: { map: Map; position: LatLng; content: HTMLElement | string; yAnchor?: number });
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
  export function load(callback: () => void): void;
}

interface Window {
  kakao?: {
    maps?: typeof kakao.maps;
  };
}
