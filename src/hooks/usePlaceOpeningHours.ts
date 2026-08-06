import { useQueries } from '@tanstack/react-query';

import {
  getPlaceHours,
  type PlaceHours,
  type PlaceHoursLookup,
} from '../apis/googlePlacesHours';

export interface PlaceHoursLookupItem extends PlaceHoursLookup {
  readonly id: string | number;
}

const PLACE_HOURS_STALE_TIME = 1000 * 60 * 5;
const PLACE_HOURS_GC_TIME = 1000 * 60 * 30;

export function usePlaceOpeningHours(
  places: readonly PlaceHoursLookupItem[]
): ReadonlyMap<string | number, PlaceHours> {
  const queries = useQueries({
    queries: places.map((place) => ({
      queryKey: [
        'placeOpeningHours',
        place.name,
        place.address ?? '',
        place.latitude ?? null,
        place.longitude ?? null,
      ],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        getPlaceHours(place, signal),
      staleTime: PLACE_HOURS_STALE_TIME,
      gcTime: PLACE_HOURS_GC_TIME,
      retry: false,
    })),
  });

  return new Map(
    places.flatMap((place, index) => {
      const hours = queries[index]?.data;

      return hours ? [[place.id, hours] as const] : [];
    })
  );
}

const KOREAN_WEEKDAY_LABELS = [
  '일요일',
  '월요일',
  '화요일',
  '수요일',
  '목요일',
  '금요일',
  '토요일',
] as const;

function getKoreanWeekdayLabel() {
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    weekday: 'short',
  }).format(new Date());

  const index = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(
    weekday
  );

  return index === -1 ? undefined : KOREAN_WEEKDAY_LABELS[index];
}

export function formatTodayOpeningHours(hours: PlaceHours): string | undefined {
  const descriptions =
    hours.regularWeekdayDescriptions.length > 0
      ? hours.regularWeekdayDescriptions
      : hours.currentWeekdayDescriptions;
  const weekday = getKoreanWeekdayLabel();
  const description =
    descriptions.find((item) => weekday && item.startsWith(weekday)) ??
    descriptions[0];

  if (!description) {
    return undefined;
  }

  if (/(?:^|:\s*)(?:closed|휴무)$/i.test(description.trim())) {
    return '휴무';
  }

  return description
    .replace(/^[^:]+:\s*/, '')
    .replace(/[~–—]/g, ' - ');
}
