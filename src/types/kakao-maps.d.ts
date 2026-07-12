interface Window {
  kakao?: {
    maps: {
      load(callback: () => void): void;
      LatLng: new (latitude: number, longitude: number) => KakaoLatLng;
      Map: new (
        container: HTMLElement,
        options: { center: KakaoLatLng; level: number },
      ) => KakaoMap;
      Marker: new (options: {
        map: KakaoMap;
        position: KakaoLatLng;
      }) => KakaoMarker;
    };
  };
}

type KakaoLatLng = object;
type KakaoMap = object;
type KakaoMarker = object;
