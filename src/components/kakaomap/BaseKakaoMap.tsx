import { useEffect, useRef, useState } from 'react';
import { loadKakaoMapsSdk } from './utils/kakaoMap';
import type { GeoPoint } from './types';

const EMPTY_MARKERS: readonly GeoPoint[] = [];

export type MapSdkStatus = 'loading' | 'ready' | 'sdk-error';

export interface BaseKakaoMapProps {
  readonly center: GeoPoint;
  readonly markers?: readonly GeoPoint[];
  readonly className?: string;
}

export function BaseKakaoMap({
  center,
  markers = EMPTY_MARKERS,
  className = '',
}: BaseKakaoMapProps) {
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

  // 3. unmount 시 marker 및 container 정리
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
      className={`bg-gray-2 relative h-[280px] w-full overflow-hidden rounded-[18px] ${className}`}
    >
      <div ref={containerRef} className="absolute inset-0" />

      {status !== 'ready' && (
        <div
          role={status === 'sdk-error' ? 'alert' : 'status'}
          aria-live={status === 'sdk-error' ? 'assertive' : 'polite'}
          className="bg-background text-gray-5 absolute inset-0 flex items-center justify-center px-5 text-center text-[14px]"
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
