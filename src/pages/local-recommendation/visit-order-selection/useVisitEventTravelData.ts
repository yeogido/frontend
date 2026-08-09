import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';

import { fetchKakaoAddressGeocode } from '../../../apis/kakaoGeocode';
import {
  fetchKakaoCarRouteDuration,
  fetchKakaoWalkRouteDuration,
} from '../../../apis/kakaoRouteDuration';
import type {
  OperatingDay,
  TimeFromPrevious,
  TransportMode,
} from '../../../apis/localRecommendations';
import { fetchOdsayTransitDurationMinutes } from '../../../apis/odsayTransitDuration';
import {
  isValidGeoPoint,
  type GeoPoint,
} from '../../../components/kakaomap/types';
import {
  usePlaceOpeningHours,
  type PlaceHoursLookupItem,
} from '../../../hooks/usePlaceOpeningHours';
import { parseWeekdayDescriptionsToOperatingDays } from '../../../utils/operatingHours';
import type { VisitEvent } from './constants';

const TRAVEL_STALE_TIME = 1000 * 60 * 5;
const TRAVEL_GC_TIME = 1000 * 60 * 30;
const GEOCODE_STALE_TIME = 1000 * 60 * 30;
const GEOCODE_GC_TIME = 1000 * 60 * 60;
const SECONDS_PER_MINUTE = 60;
const TRAVEL_MODES: readonly TransportMode[] = ['WALK', 'PUBLIC', 'CAR'];

export interface VisitEventTravelData {
  readonly operatingDaysByEventId: ReadonlyMap<string, OperatingDay[]>;
  readonly timesFromPreviousByEventId: ReadonlyMap<string, TimeFromPrevious[]>;
}

interface EventPair {
  readonly toId: string;
  readonly start: GeoPoint;
  readonly end: GeoPoint;
}

// CONTENT(행사) 이벤트는 PersistedSelectedFestival에 lat/lng 필드가 없어
// address 문자열을 카카오 주소 검색으로 지오코딩해서 좌표를 얻는다.
function useEventGeoPoints(
  visitEvents: readonly VisitEvent[]
): ReadonlyMap<string, GeoPoint> {
  const contentEvents = useMemo(
    () => visitEvents.filter((event) => event.kind === 'CONTENT'),
    [visitEvents]
  );

  const geocodeQueries = useQueries({
    queries: contentEvents.map((event) => ({
      queryKey: ['visitEventGeocode', event.address],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        fetchKakaoAddressGeocode(event.address, signal),
      staleTime: GEOCODE_STALE_TIME,
      gcTime: GEOCODE_GC_TIME,
      retry: false,
    })),
  });

  const geoPointByEventId = new Map<string, GeoPoint>();

  for (const event of visitEvents) {
    if (event.kind === 'PLACE') {
      const point = { latitude: event.latitude, longitude: event.longitude };
      if (isValidGeoPoint(point)) geoPointByEventId.set(event.id, point);
    }
  }
  contentEvents.forEach((event, index) => {
    const geocoded = geocodeQueries[index]?.data;
    if (geocoded && isValidGeoPoint(geocoded)) {
      geoPointByEventId.set(event.id, geocoded);
    }
  });

  return geoPointByEventId;
}

function toEventPairs(
  visitEvents: readonly VisitEvent[],
  geoPointByEventId: ReadonlyMap<string, GeoPoint>
): EventPair[] {
  const pairs: EventPair[] = [];

  for (let index = 0; index < visitEvents.length - 1; index += 1) {
    const start = geoPointByEventId.get(visitEvents[index].id);
    const end = geoPointByEventId.get(visitEvents[index + 1].id);

    if (start && end) {
      pairs.push({ toId: visitEvents[index + 1].id, start, end });
    }
  }

  return pairs;
}

function toMinutes(seconds: number | null | undefined): number | undefined {
  return seconds == null ? undefined : Math.round(seconds / SECONDS_PER_MINUTE);
}

function fetchDurationForMode(
  mode: TransportMode,
  start: GeoPoint,
  end: GeoPoint,
  signal?: AbortSignal
): Promise<number | null> {
  if (mode === 'WALK') return fetchKakaoWalkRouteDuration(start, end, signal);
  if (mode === 'CAR') return fetchKakaoCarRouteDuration(start, end, signal);
  return fetchOdsayTransitDurationMinutes(start, end, signal);
}

/**
 * 방문 순서 목록에서 코스 등록 요청에 실어 보낼 두 가지를 계산한다.
 * - operatingDays: PLACE 아이템의 구글 플레이스 영업시간
 * - timesFromPrevious: 이전 아이템 → 이번 아이템 구간의 도보/대중교통/자동차 소요시간
 */
export function useVisitEventTravelData(
  visitEvents: readonly VisitEvent[]
): VisitEventTravelData {
  const placeLookups: PlaceHoursLookupItem[] = useMemo(
    () =>
      visitEvents.flatMap((event) =>
        event.kind === 'PLACE'
          ? [
              {
                id: event.id,
                name: event.name,
                address: event.roadAddress || event.lotAddress,
                latitude: event.latitude,
                longitude: event.longitude,
              },
            ]
          : []
      ),
    [visitEvents]
  );
  const placeHoursByEventId = usePlaceOpeningHours(placeLookups);

  const geoPointByEventId = useEventGeoPoints(visitEvents);
  const pairs = toEventPairs(visitEvents, geoPointByEventId);

  const queries = useQueries({
    queries: pairs.flatMap((pair) =>
      TRAVEL_MODES.map((mode) => ({
        queryKey: ['visitEventTravelDuration', mode, pair.start, pair.end],
        queryFn: ({ signal }: { signal: AbortSignal }) =>
          fetchDurationForMode(mode, pair.start, pair.end, signal),
        staleTime: TRAVEL_STALE_TIME,
        gcTime: TRAVEL_GC_TIME,
        retry: false,
      }))
    ),
  });

  const operatingDaysByEventId = new Map<string, OperatingDay[]>(
    visitEvents.flatMap((event) => {
      if (event.kind !== 'PLACE') return [];

      const hours = placeHoursByEventId.get(event.id);
      const operatingDays = hours
        ? parseWeekdayDescriptionsToOperatingDays(
            hours.regularWeekdayDescriptions
          )
        : [];

      return operatingDays.length > 0
        ? [[event.id, operatingDays] as const]
        : [];
    })
  );

  const timesFromPreviousByEventId = new Map<string, TimeFromPrevious[]>(
    pairs.flatMap((pair, pairIndex) => {
      const times = TRAVEL_MODES.flatMap((mode, modeIndex) => {
        const minutes = toMinutes(
          queries[pairIndex * TRAVEL_MODES.length + modeIndex]?.data
        );
        return minutes === undefined
          ? []
          : [{ transportMode: mode, durationMinutes: minutes }];
      });

      return times.length > 0 ? [[pair.toId, times] as const] : [];
    })
  );

  return { operatingDaysByEventId, timesFromPreviousByEventId };
}
