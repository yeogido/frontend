import { useEffect, useRef, useState } from 'react';

import type { CourseStop } from '../types/course';
import {
  getCurrentMapCoordinates,
  loadKakaoMapsSdk,
} from '../utils/kakaoMap';

import CourseStopItem from './CourseStopItem';

interface CourseMapProps {
  stops: CourseStop[];
}

function CourseMap({ stops }: CourseMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapStatus, setMapStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading',
  );

  useEffect(() => {
    let isActive = true;

    async function initializeMap() {
      try {
        const [coordinates] = await Promise.all([
          getCurrentMapCoordinates(),
          loadKakaoMapsSdk(import.meta.env.VITE_KAKAO_MAP_API_KEY ?? ''),
        ]);

        if (!isActive || !mapContainerRef.current || !window.kakao?.maps) {
          return;
        }

        const position = new window.kakao.maps.LatLng(
          coordinates.latitude,
          coordinates.longitude,
        );
        const map = new window.kakao.maps.Map(mapContainerRef.current, {
          center: position,
          level: 4,
        });

        new window.kakao.maps.Marker({ map, position });
        setMapStatus('ready');
      } catch {
        if (isActive) {
          setMapStatus('error');
        }
      }
    }

    void initializeMap();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section className="px-5">
      <h2 className="mb-3 text-[16px] leading-none font-bold text-black">
        코스 지도
      </h2>
      <div className="flex flex-col gap-3">
        <div className="relative aspect-square min-h-[280px] w-full max-h-[380px] overflow-hidden rounded-xl bg-gray-2">
          <div ref={mapContainerRef} className="absolute inset-0" />

          {mapStatus !== 'ready' && (
            <div className="absolute inset-0 flex items-center justify-center bg-background px-5 text-center text-[14px] text-gray-5">
              {mapStatus === 'loading'
                ? '현재 위치를 확인하고 지도를 불러오는 중입니다.'
                : '지도를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'}
            </div>
          )}
        </div>

        <div className="mt-4">
          {stops.map((stop, index) => (
            <CourseStopItem
              key={stop.id}
              stop={stop}
              isLast={index === stops.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default CourseMap;
