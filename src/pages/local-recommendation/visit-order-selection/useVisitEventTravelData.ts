import { fetchKakaoAddressGeocode } from '../../../apis/kakaoGeocode';
import { fetchKakaoCarRouteDuration } from '../../../apis/kakaoRouteDuration';
import type {
  OperatingDay,
  TimeFromPrevious,
} from '../../../apis/localRecommendations';
import { fetchOdsayTransitDurationMinutes } from '../../../apis/odsayTransitDuration';
import { getPlaceHours } from '../../../apis/googlePlacesHours';
import {
  isValidGeoPoint,
  type GeoPoint,
} from '../../../components/kakaomap/types';
import { parseWeekdayDescriptionsToOperatingDays } from '../../../utils/operatingHours';
import type { VisitEvent } from './constants';

const SECONDS_PER_MINUTE = 60;
export const TRAVEL_DATA_TIMEOUT_MS = 10_000;

export interface VisitEventTravelData {
  readonly operatingDaysByEventId: ReadonlyMap<string, OperatingDay[]>;
  readonly timesFromPreviousByEventId: ReadonlyMap<string, TimeFromPrevious[]>;
}

interface EventPair {
  readonly toId: string;
  readonly start: GeoPoint;
  readonly end: GeoPoint;
}

function toMinutes(seconds: number | null): number | undefined {
  return seconds === null
    ? undefined
    : Math.round(seconds / SECONDS_PER_MINUTE);
}

export async function resolveVisitEventGeoPoints(
  visitEvents: readonly VisitEvent[],
  signal?: AbortSignal
): Promise<ReadonlyMap<string, GeoPoint>> {
  const geoPointByEventId = new Map<string, GeoPoint>();

  for (const event of visitEvents) {
    if (event.kind !== 'PLACE') continue;

    const point = { latitude: event.latitude, longitude: event.longitude };
    if (isValidGeoPoint(point)) geoPointByEventId.set(event.id, point);
  }

  const contentPoints = await Promise.all(
    visitEvents
      .filter((event) => event.kind === 'CONTENT')
      .map(async (event) => {
        try {
          const point = await fetchKakaoAddressGeocode(event.address, signal);
          return point && isValidGeoPoint(point)
            ? ([event.id, point] as const)
            : null;
        } catch {
          return null;
        }
      })
  );

  for (const entry of contentPoints) {
    if (entry) geoPointByEventId.set(entry[0], entry[1]);
  }

  return geoPointByEventId;
}

function getEventPairs(
  visitEvents: readonly VisitEvent[],
  geoPointByEventId: ReadonlyMap<string, GeoPoint>
): EventPair[] {
  const pairs: EventPair[] = [];

  for (let index = 1; index < visitEvents.length; index += 1) {
    const start = geoPointByEventId.get(visitEvents[index - 1].id);
    const end = geoPointByEventId.get(visitEvents[index].id);

    if (start && end) pairs.push({ toId: visitEvents[index].id, start, end });
  }

  return pairs;
}

async function getOperatingDaysByEventId(
  visitEvents: readonly VisitEvent[],
  signal?: AbortSignal
): Promise<ReadonlyMap<string, OperatingDay[]>> {
  const entries = await Promise.all(
    visitEvents.flatMap((event) =>
      event.kind === 'PLACE'
        ? [
            (async () => {
              try {
                const hours = await getPlaceHours(
                  {
                    name: event.name,
                    address: event.roadAddress || event.lotAddress,
                    latitude: event.latitude,
                    longitude: event.longitude,
                  },
                  signal
                );
                const operatingDays = hours
                  ? parseWeekdayDescriptionsToOperatingDays(
                      hours.regularWeekdayDescriptions
                    )
                  : [];

                return [event.id, operatingDays] as const;
              } catch {
                return [event.id, [] as OperatingDay[]] as const;
              }
            })(),
          ]
        : []
    )
  );

  return new Map(entries);
}

async function getTimesFromPreviousByEventId(
  pairs: readonly EventPair[],
  signal?: AbortSignal
): Promise<ReadonlyMap<string, TimeFromPrevious[]>> {
  const entries = await Promise.all(
    pairs.map(async (pair) => {
      const [transitResult, carResult] = await Promise.allSettled([
        fetchOdsayTransitDurationMinutes(pair.start, pair.end, signal),
        fetchKakaoCarRouteDuration(pair.start, pair.end, signal),
      ]);
      const transitMinutes =
        transitResult.status === 'fulfilled' ? transitResult.value : undefined;
      const carMinutes =
        carResult.status === 'fulfilled'
          ? toMinutes(carResult.value)
          : undefined;
      const times: TimeFromPrevious[] = [
        ...(transitMinutes === undefined || transitMinutes === null
          ? []
          : [
              {
                transportMode: 'PUBLIC' as const,
                durationMinutes: transitMinutes,
              },
            ]),
        ...(carMinutes === undefined
          ? []
          : [{ transportMode: 'CAR' as const, durationMinutes: carMinutes }]),
      ];

      return [pair.toId, times] as const;
    })
  );

  return new Map(entries);
}

/** 등록·수정 직전에 외부 영업시간과 이동시간을 조회한다. */
export async function fetchVisitEventTravelData(
  visitEvents: readonly VisitEvent[]
): Promise<VisitEventTravelData> {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    TRAVEL_DATA_TIMEOUT_MS
  );

  try {
    const geoPointByEventId = await resolveVisitEventGeoPoints(
      visitEvents,
      controller.signal
    );
    const pairs = getEventPairs(visitEvents, geoPointByEventId);
    const [operatingDaysByEventId, timesFromPreviousByEventId] =
      await Promise.all([
        getOperatingDaysByEventId(visitEvents, controller.signal),
        getTimesFromPreviousByEventId(pairs, controller.signal),
      ]);

    return { operatingDaysByEventId, timesFromPreviousByEventId };
  } finally {
    clearTimeout(timeoutId);
  }
}
