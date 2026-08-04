import { useEffect, useMemo, useState } from 'react';
import { fetchKakaoWalkingRoute } from '../../../apis/kakaoWalkingRoute';
import { SectionHeader } from '../../../components/common';
import { BaseKakaoMap } from '../../../components/kakaomap/BaseKakaoMap';
import {
  isValidGeoPoint,
  type GeoPoint,
} from '../../../components/kakaomap/types';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import type { CourseStop } from '../types/courseDetail';

// Figma 390 디자인 기준 리터럴 px
// (카카오맵 SDK 컨테이너 관련: height/border-radius는 순수 CSS 크기값이라 스케일 적용 가능,
//  transform: scale()은 절대 사용하지 않음)
const HEADER_MARGIN_BOTTOM = 15;
const MAP_HEIGHT = 342;
const MAP_RADIUS = 18;
const EMPTY_STATE_FONT_SIZE = 14;

export interface CourseRouteMapProps {
  readonly stops: readonly CourseStop[];
  readonly className?: string;
}

interface WalkingRouteResult {
  readonly locations: readonly GeoPoint[];
  readonly route: readonly GeoPoint[];
}

const EMPTY_ROUTE_RESULT: WalkingRouteResult = { locations: [], route: [] };

export function CourseRouteMap({ stops, className = '' }: CourseRouteMapProps) {
  const scale = useGlobalScale();
  const [routeResult, setRouteResult] =
    useState<WalkingRouteResult>(EMPTY_ROUTE_RESULT);

  // 1. 유효한 stop.location만 추출
  const validLocations: readonly GeoPoint[] = useMemo(() => {
    return stops
      .map((stop) => stop.location)
      .filter((loc): loc is GeoPoint => isValidGeoPoint(loc));
  }, [stops]);

  const center = validLocations[0] ?? null;

  useEffect(() => {
    if (validLocations.length < 2) {
      return;
    }

    const controller = new AbortController();

    void fetchKakaoWalkingRoute(validLocations, controller.signal)
      .then((route) => {
        if (!controller.signal.aborted) {
          setRouteResult({ locations: validLocations, route });
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setRouteResult({ locations: validLocations, route: [] });
        }
      });

    return () => controller.abort();
  }, [validLocations]);

  // 정류장이 바뀌어 새 요청이 시작되면, 이전 좌표에 대한 결과는 즉시 무효화되어
  // 새 마커에 옛 경로가 겹쳐 보이지 않도록 함(파생값이라 별도 setState 불필요).
  const routePath =
    routeResult.locations === validLocations ? routeResult.route : [];

  // 2. 좌표가 없으면 안내 문구 표시
  if (!center) {
    return (
      <section className={className}>
        <div
          className="[&_h2]:font-bold"
          style={{ marginBottom: HEADER_MARGIN_BOTTOM * scale }}
        >
          <SectionHeader title="코스 지도" />
        </div>
        <div
          role="status"
          className="bg-gray-2 text-gray-5 flex w-full items-center justify-center"
          style={{
            height: MAP_HEIGHT * scale,
            borderRadius: MAP_RADIUS * scale,
            fontSize: EMPTY_STATE_FONT_SIZE * scale,
          }}
        >
          등록된 코스 위치 정보가 없습니다.
        </div>
      </section>
    );
  }

  // 3. 첫 좌표를 center로 사용, 전체 좌표를 markers로 전달
  return (
    <section className={className}>
      <div
        className="[&_h2]:font-bold"
        style={{ marginBottom: HEADER_MARGIN_BOTTOM * scale }}
      >
        <SectionHeader title="코스 지도" />
      </div>
      <BaseKakaoMap
        center={center}
        markers={validLocations}
        routePath={routePath}
      />
    </section>
  );
}

export default CourseRouteMap;
