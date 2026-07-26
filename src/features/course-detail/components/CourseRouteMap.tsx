import { useMemo } from 'react';
import { SectionHeader } from '../../../components/common';
import { BaseKakaoMap } from '../../../components/kakaomap/BaseKakaoMap';
import {
  isValidGeoPoint,
  type GeoPoint,
} from '../../../components/kakaomap/types';
import type { CourseStop } from '../types/courseDetail';

export interface CourseRouteMapProps {
  readonly stops: readonly CourseStop[];
  readonly className?: string;
}

export function CourseRouteMap({ stops, className = '' }: CourseRouteMapProps) {
  // 1. 유효한 stop.location만 추출
  const validLocations: readonly GeoPoint[] = useMemo(() => {
    return stops
      .map((stop) => stop.location)
      .filter((loc): loc is GeoPoint => isValidGeoPoint(loc));
  }, [stops]);

  const center = validLocations[0] ?? null;

  // 2. 좌표가 없으면 안내 문구 표시
  if (!center) {
    return (
      <section className={className}>
        <div className="mb-[15px] [&_h2]:font-bold">
          <SectionHeader title="코스 지도" />
        </div>
        <div
          role="status"
          className="bg-gray-2 text-gray-5 flex h-[280px] w-full items-center justify-center rounded-[18px] text-[14px]"
        >
          등록된 코스 위치 정보가 없습니다.
        </div>
      </section>
    );
  }

  // 3. 첫 좌표를 center로 사용, 전체 좌표를 markers로 전달
  return (
    <section className={className}>
      <div className="mb-[15px] [&_h2]:font-bold">
        <SectionHeader title="코스 지도" />
      </div>
      <BaseKakaoMap center={center} markers={validLocations} />
    </section>
  );
}

export default CourseRouteMap;
