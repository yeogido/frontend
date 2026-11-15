// ponytail: PLACE images depend on pendingImages/place.imageUrl set at
// place-selection — a freshly picked place without an uploaded photo yet
// falls back to the shared thumbnail (store never persists blob/object
// URLs, see localRecommendation.store.ts). CONTENT (festival) images are
// persisted as imageSrc from event-selection and only fall back when the
// API didn't return a thumbnail.
export type VisitEvent =
  | {
      id: string;
      kind: 'PLACE';
      name: string;
      address: string;
      imageSrc: string;
      externalPlaceId: string;
      categoryGroupCode: string;
      roadAddress: string;
      lotAddress: string;
      latitude: number;
      longitude: number;
      imageKey: string | null;
    }
  | {
      id: string;
      kind: 'CONTENT';
      name: string;
      address: string;
      imageSrc: string;
      contentId: number;
    };

const DAY_DROPPABLE_PREFIX = 'visit-order-day-';

/** 일차 섹션 자체의 드롭 영역 id — 비어 있는 일차로도 끌어다 놓을 수 있어야 한다. */
export function getDayDroppableId(dayIndex: number): string {
  return `${DAY_DROPPABLE_PREFIX}${dayIndex}`;
}

/** 드롭 대상이 일차 섹션이면 그 인덱스를, 개별 항목이면 null을 준다. */
export function parseDayDroppableId(id: string): number | null {
  if (!id.startsWith(DAY_DROPPABLE_PREFIX)) return null;

  const dayIndex = Number(id.slice(DAY_DROPPABLE_PREFIX.length));

  return Number.isInteger(dayIndex) ? dayIndex : null;
}

export function findVisitEventDayIndex(
  visitEventsByDay: readonly (readonly VisitEvent[])[],
  eventId: string
): number {
  return visitEventsByDay.findIndex((dayEvents) =>
    dayEvents.some((event) => event.id === eventId)
  );
}

export function toVisitOrder(
  visitEventsByDay: readonly (readonly VisitEvent[])[]
): string[][] {
  return visitEventsByDay.map((dayEvents) =>
    dayEvents.map((event) => event.id)
  );
}
