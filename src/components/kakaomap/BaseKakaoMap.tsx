import { useEffect, useRef, useState } from 'react';
import { loadKakaoMapsSdk } from './utils/kakaoMap';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import type { GeoPoint } from './types';

const EMPTY_MARKERS: readonly GeoPoint[] = [];
const EMPTY_IMAGE_MARKERS: readonly ImageMapMarker[] = [];
const EMPTY_ROUTE_PATH: readonly GeoPoint[] = [];

// Figma 390 디자인 기준 리터럴 px
// 카카오맵 SDK가 컨테이너 DOM에 직접 Map 인스턴스를 붙이므로
// transform: scale()은 절대 사용하지 않는다. height/border-radius/padding처럼
// 순수 CSS 크기 값에만 패턴 A(style + scale)를 적용한다.
const MAP_HEIGHT = 342;
const MAP_RADIUS = 18;
const OVERLAY_PADDING_X = 20;
const OVERLAY_FONT_SIZE = 14;
const IMAGE_MARKER_SIZE = 36;
const IMAGE_MARKER_BORDER_WIDTH = 2;
const IMAGE_MARKER_FOCUS_SCALE = 1.15;
// theme.css의 --color-main-5. Kakao Polyline strokeColor는 SVG 속성으로
// 직접 적용되어 CSS 변수(var())를 해석하지 못하므로 값을 그대로 옮겨온다.
const ROUTE_LINE_COLOR = '#ff6f41';

export type MapSdkStatus = 'loading' | 'ready' | 'sdk-error';

export interface BaseKakaoMapProps {
  readonly center: GeoPoint;
  readonly markers?: readonly GeoPoint[];
  readonly imageMarkers?: readonly ImageMapMarker[];
  readonly routePath?: readonly GeoPoint[];
  readonly focusedLocation?: GeoPoint | null;
  readonly onMarkerClick?: (point: GeoPoint) => void;
  readonly className?: string;
}

export interface ImageMapMarker {
  readonly location: GeoPoint;
  readonly imageUrl: string;
}

type ResizableKakaoMap = kakao.maps.Map & {
  getCenter(): kakao.maps.LatLng;
  relayout(): void;
  setCenter(center: kakao.maps.LatLng): void;
};

export function BaseKakaoMap({
  center,
  markers = EMPTY_MARKERS,
  imageMarkers = EMPTY_IMAGE_MARKERS,
  routePath = EMPTY_ROUTE_PATH,
  focusedLocation = null,
  onMarkerClick,
  className = '',
}: BaseKakaoMapProps) {
  const scale = useGlobalScale();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const markersRef = useRef<kakao.maps.Marker[]>([]);
  const imageMarkersRef = useRef<kakao.maps.CustomOverlay[]>([]);
  const imageMarkerElementsRef = useRef<
    { location: GeoPoint; element: HTMLDivElement }[]
  >([]);
  const routeRef = useRef<kakao.maps.Polyline | null>(null);

  const apiKey = import.meta.env.VITE_KAKAO_MAP_API_KEY;
  const [status, setStatus] = useState<MapSdkStatus>(
    apiKey ? 'loading' : 'sdk-error'
  );

  const { latitude, longitude } = center;

  // 1. Kakao Maps SDK 로드 & center 좌표로 지도 생성
  useEffect(() => {
    let isCancelled = false;

    if (!apiKey) return;

    const mapKey = apiKey;

    async function initMap() {
      try {
        await loadKakaoMapsSdk(mapKey);
        if (isCancelled || !containerRef.current || mapRef.current) return;

        const kakaoCenter = new window.kakao.maps.LatLng(latitude, longitude);
        const mapInstance = new window.kakao.maps.Map(containerRef.current, {
          center: kakaoCenter,
          level: 4,
        });

        mapRef.current = mapInstance;
        setStatus('ready');
      } catch {
        if (!isCancelled) setStatus('sdk-error');
      }
    }

    void initMap();

    return () => {
      isCancelled = true;
    };
  }, [apiKey, latitude, longitude]);

  // 2. markers 좌표에 기본 또는 이미지 마커 표시
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    imageMarkersRef.current.forEach((marker) => marker.setMap(null));
    imageMarkersRef.current = [];
    imageMarkerElementsRef.current = [];

    const imageMarkerLocations = new Set(
      imageMarkers.map(
        ({ location }) => `${location.latitude},${location.longitude}`
      )
    );
    const newMarkers = markers.flatMap((m) => {
      if (imageMarkerLocations.has(`${m.latitude},${m.longitude}`)) {
        return [];
      }

      const pos = new window.kakao.maps.LatLng(m.latitude, m.longitude);
      const marker = new window.kakao.maps.Marker({ map, position: pos });

      if (onMarkerClick) {
        window.kakao.maps.event.addListener(marker, 'click', () =>
          onMarkerClick(m)
        );
      }

      return [marker];
    });
    const markerSize = IMAGE_MARKER_SIZE * scale;
    const newImageMarkerElements: {
      location: GeoPoint;
      element: HTMLDivElement;
    }[] = [];
    const newImageMarkers = imageMarkers.map(({ location, imageUrl }) => {
      const marker = document.createElement('div');
      marker.style.width = `${markerSize}px`;
      marker.style.minWidth = `${markerSize}px`;
      marker.style.maxWidth = `${markerSize}px`;
      marker.style.height = `${markerSize}px`;
      marker.style.minHeight = `${markerSize}px`;
      marker.style.maxHeight = `${markerSize}px`;
      marker.style.boxSizing = 'border-box';
      marker.style.overflow = 'hidden';
      marker.style.border = `${IMAGE_MARKER_BORDER_WIDTH * scale}px solid var(--color-main-5)`;
      marker.style.borderRadius = '8px';
      marker.style.backgroundColor = 'var(--color-main-5)';
      marker.style.lineHeight = '0';
      marker.style.transition = 'transform 0.2s ease-out';

      if (onMarkerClick) {
        marker.style.cursor = 'pointer';
        marker.addEventListener('click', () => onMarkerClick(location));
      }

      const image = document.createElement('img');
      image.src = imageUrl;
      image.alt = '';
      image.setAttribute('aria-hidden', 'true');
      image.style.display = 'block';
      image.style.width = '100%';
      image.style.minWidth = '100%';
      image.style.maxWidth = '100%';
      image.style.height = '100%';
      image.style.minHeight = '100%';
      image.style.maxHeight = '100%';
      image.style.objectFit = 'cover';
      marker.append(image);

      newImageMarkerElements.push({ location, element: marker });

      return new window.kakao.maps.CustomOverlay({
        map,
        position: new window.kakao.maps.LatLng(
          location.latitude,
          location.longitude
        ),
        content: marker,
        yAnchor: 0.5,
      });
    });

    markersRef.current = newMarkers;
    imageMarkersRef.current = newImageMarkers;
    imageMarkerElementsRef.current = newImageMarkerElements;
  }, [imageMarkers, markers, onMarkerClick, scale, status]);

  // 2b. focusedLocation과 일치하는 이미지 마커를 확대해 강조 표시.
  useEffect(() => {
    imageMarkerElementsRef.current.forEach(({ location, element }) => {
      const isFocused =
        !!focusedLocation &&
        location.latitude === focusedLocation.latitude &&
        location.longitude === focusedLocation.longitude;

      element.style.transform = isFocused
        ? `scale(${IMAGE_MARKER_FOCUS_SCALE})`
        : 'scale(1)';
    });
  }, [focusedLocation, imageMarkers]);

  // 2c. focusedLocation이 바뀌면 지도를 해당 좌표로 이동.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focusedLocation) return;

    map.panTo(
      new window.kakao.maps.LatLng(
        focusedLocation.latitude,
        focusedLocation.longitude
      )
    );
  }, [focusedLocation, status]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    routeRef.current?.setMap(null);
    routeRef.current = null;

    if (routePath.length < 2) return;

    routeRef.current = new window.kakao.maps.Polyline({
      map,
      path: routePath.map(
        (point) => new window.kakao.maps.LatLng(point.latitude, point.longitude)
      ),
      strokeWeight: 5,
      strokeColor: ROUTE_LINE_COLOR,
      strokeOpacity: 0.85,
      strokeStyle: 'dash',
    });

    const bounds = new window.kakao.maps.LatLngBounds();
    routePath.forEach((point) => {
      bounds.extend(
        new window.kakao.maps.LatLng(point.latitude, point.longitude)
      );
    });
    map.setBounds(bounds);
  }, [routePath, status]);

  // 3. Keep the rendered map aligned with its responsive container.
  useEffect(() => {
    const container = containerRef.current;
    const map = mapRef.current as ResizableKakaoMap | null;

    if (status !== 'ready' || !container || !map) {
      return;
    }

    let previousWidth = container.clientWidth;
    let previousHeight = container.clientHeight;
    let animationFrame: number | undefined;

    const scheduleRelayout = () => {
      const nextWidth = container.clientWidth;
      const nextHeight = container.clientHeight;

      if (nextWidth === previousWidth && nextHeight === previousHeight) {
        return;
      }

      previousWidth = nextWidth;
      previousHeight = nextHeight;

      if (animationFrame !== undefined) {
        window.cancelAnimationFrame(animationFrame);
      }

      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = undefined;
        const currentCenter = map.getCenter();

        map.relayout();
        map.setCenter(currentCenter);
      });
    };

    const observer = new ResizeObserver(scheduleRelayout);

    observer.observe(container);
    window.addEventListener('resize', scheduleRelayout);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', scheduleRelayout);

      if (animationFrame !== undefined) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, [status]);

  // 4. unmount 시 marker 및 container 정리
  useEffect(() => {
    const container = containerRef.current;

    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      imageMarkersRef.current.forEach((m) => m.setMap(null));
      imageMarkersRef.current = [];
      imageMarkerElementsRef.current = [];
      routeRef.current?.setMap(null);
      routeRef.current = null;
      if (container) {
        container.innerHTML = '';
      }
      mapRef.current = null;
    };
  }, []);

  return (
    <div
      className={`bg-gray-2 relative w-full overflow-hidden ${className}`}
      style={{ height: MAP_HEIGHT * scale, borderRadius: MAP_RADIUS * scale }}
    >
      <div ref={containerRef} className="absolute inset-0" />

      {status !== 'ready' && (
        <div
          role={status === 'sdk-error' ? 'alert' : 'status'}
          aria-live={status === 'sdk-error' ? 'assertive' : 'polite'}
          className="bg-background text-gray-5 absolute inset-0 flex items-center justify-center text-center"
          style={{
            paddingLeft: OVERLAY_PADDING_X * scale,
            paddingRight: OVERLAY_PADDING_X * scale,
            fontSize: OVERLAY_FONT_SIZE * scale,
          }}
        >
          {status === 'loading' && '지도를 불러오는 중입니다...'}
          {status === 'sdk-error' &&
            '지도를 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.'}
        </div>
      )}
    </div>
  );
}

export default BaseKakaoMap;
