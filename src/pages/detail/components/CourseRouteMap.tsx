import { memo, useCallback, useMemo } from 'react';
import { SectionHeader } from '../../../components/common';
import { BaseKakaoMap } from '../../../components/kakaomap/BaseKakaoMap';
import {
  isValidGeoPoint,
  type GeoPoint,
} from '../../../components/kakaomap/types';
import { openKakaoMapRoute } from '../../../components/kakaomap/utils/kakaoMapLink';
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
  readonly focusedStopId?: number | null;
  readonly onStopFocus?: (stopId: number) => void;
  readonly className?: string;
}

function CourseRouteMapComponent({
  stops,
  focusedStopId = null,
  onStopFocus,
  className = '',
}: CourseRouteMapProps) {
  const scale = useGlobalScale();

  // 1. 유효한 stop.location만 추출
  const validLocations: readonly GeoPoint[] = useMemo(() => {
    return stops
      .map((stop) => stop.location)
      .filter((loc): loc is GeoPoint => isValidGeoPoint(loc));
  }, [stops]);

  const center = validLocations[0] ?? null;
  const imageMarkers = useMemo(
    () =>
      stops.flatMap((stop) =>
        isValidGeoPoint(stop.location) && stop.image
          ? [{ location: stop.location, imageUrl: stop.image }]
          : []
      ),
    [stops]
  );
  const focusedLocation =
    stops.find((stop) => stop.id === focusedStopId)?.location ?? null;

  // 실제 도보 경로 대신, 방문 순서대로 정류장을 이은 점선을 표시한다.
  const routePath = validLocations;

  const handleMarkerClick = useCallback(
    (point: GeoPoint) => {
      const matchedStop = stops.find(
        (stop) =>
          stop.location?.latitude === point.latitude &&
          stop.location?.longitude === point.longitude
      );

      if (matchedStop) {
        onStopFocus?.(matchedStop.id);
        openKakaoMapRoute(matchedStop.name, point);
      }
    },
    [onStopFocus, stops]
  );

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
        imageMarkers={imageMarkers}
        routePath={routePath}
        focusedLocation={focusedLocation}
        onMarkerClick={handleMarkerClick}
      />
    </section>
  );
}

// liked/hours 같은 지도와 무관한 필드 변경(좋아요 토글 등)으로 stops 배열
// 레퍼런스만 바뀌는 경우엔 리렌더를 건너뛴다 — 그대로 두면 좋아요를 누를
// 때마다 마커가 재생성되어 지도가 깜빡인다.
function areRouteMapPropsEqual(
  prevProps: CourseRouteMapProps,
  nextProps: CourseRouteMapProps
): boolean {
  return (
    prevProps.className === nextProps.className &&
    prevProps.focusedStopId === nextProps.focusedStopId &&
    prevProps.onStopFocus === nextProps.onStopFocus &&
    prevProps.stops.length === nextProps.stops.length &&
    prevProps.stops.every((stop, index) => {
      const nextStop = nextProps.stops[index];

      return (
        stop.id === nextStop.id &&
        stop.location?.latitude === nextStop.location?.latitude &&
        stop.location?.longitude === nextStop.location?.longitude
      );
    })
  );
}

export const CourseRouteMap = memo(
  CourseRouteMapComponent,
  areRouteMapPropsEqual
);

export default CourseRouteMap;
