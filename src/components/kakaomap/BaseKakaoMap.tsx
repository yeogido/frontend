import { useEffect, useRef, useState } from 'react';
import { loadKakaoMapsSdk } from './utils/kakaoMap';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import type { GeoPoint } from './types';

const EMPTY_MARKERS: readonly GeoPoint[] = [];

// Figma 390 디자인 기준 리터럴 px
// 카카오맵 SDK가 컨테이너 DOM에 직접 Map 인스턴스를 붙이므로
// transform: scale()은 절대 사용하지 않는다. height/border-radius/padding처럼
// 순수 CSS 크기 값에만 패턴 A(style + scale)를 적용한다.
const MAP_HEIGHT = 280;
const MAP_RADIUS = 18;
const OVERLAY_PADDING_X = 20;
const OVERLAY_FONT_SIZE = 14;

export type MapSdkStatus = 'loading' | 'ready' | 'sdk-error';

export interface BaseKakaoMapProps {
  readonly center: GeoPoint;
  readonly markers?: readonly GeoPoint[];
  readonly className?: string;
}

type ResizableKakaoMap = kakao.maps.Map & {
  getCenter(): kakao.maps.LatLng;
  relayout(): void;
  setCenter(center: kakao.maps.LatLng): void;
};

export function BaseKakaoMap({
  center,
  markers = EMPTY_MARKERS,
  className = '',
}: BaseKakaoMapProps) {
  const scale = useGlobalScale();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const markersRef = useRef<kakao.maps.Marker[]>([]);

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

  // 2. markers 좌표에 기본 kakao.maps.Marker 표시
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    const newMarkers = markers.map((m) => {
      const pos = new window.kakao.maps.LatLng(m.latitude, m.longitude);
      return new window.kakao.maps.Marker({
        map,
        position: pos,
      });
    });

    markersRef.current = newMarkers;
  }, [markers, status]);

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
